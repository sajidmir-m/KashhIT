
// This file contains logic to recover from startup crashes caused by corrupted storage or cached scripts.

const RECOVERY_KEY = 'app_startup_attempts';
const MAX_ATTEMPTS = 3;
const RESET_WINDOW_MS = 5000; // 5 seconds to consider it a "startup" crash

export const initStartupRecovery = () => {
    if (typeof window === 'undefined') return;

    try {
        // Check if we are in a crash loop
        const attempts = parseInt(localStorage.getItem(RECOVERY_KEY) || '0');
        const lastAttempt = parseInt(localStorage.getItem(RECOVERY_KEY + '_time') || '0');
        const now = Date.now();

        // If last attempt was long ago, reset counter
        if (now - lastAttempt > RESET_WINDOW_MS) {
            localStorage.setItem(RECOVERY_KEY, '1');
            localStorage.setItem(RECOVERY_KEY + '_time', now.toString());
        } else {
            // We are restarting quickly
            const newAttempts = attempts + 1;
            localStorage.setItem(RECOVERY_KEY, newAttempts.toString());
            localStorage.setItem(RECOVERY_KEY + '_time', now.toString());

            if (newAttempts >= MAX_ATTEMPTS) {
                console.warn('Detected startup crash loop. Clearing all storage to recover.');

                // Clear everything
                localStorage.clear();
                sessionStorage.clear();

                // Clear cookies (basic attempt)
                document.cookie.split(";").forEach((c) => {
                    document.cookie = c
                        .replace(/^ +/, "")
                        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
                });

                // Reset the counter so we don't loop forever if clearing storage doesn't fix it
                localStorage.setItem(RECOVERY_KEY, '0');

                // We don't reload here because we want the app to try rendering with clean state now
                // If we reload, we might just loop again if the issue is server-side or code-related
            }
        }

        // Global error handler for startup
        const handleGlobalError = (event: ErrorEvent | PromiseRejectionEvent) => {
            // Only act if we are still in the startup window
            if (Date.now() - now > RESET_WINDOW_MS) return;

            console.error('Startup error detected:', event);

            // If we haven't maxed out attempts, reload to try again (which will increment counter)
            // If we HAVE maxed out, we already cleared storage above, so hopefully this run works.
            // If it still fails after clearing storage, we let the app crash (white screen) 
            // because reloading again won't help and will just flash.
        };

        window.addEventListener('error', handleGlobalError);
        window.addEventListener('unhandledrejection', handleGlobalError);

    } catch (e) {
        // If local storage itself is broken, we can't track attempts.
        // Just try to clear it and hope for the best.
        console.error('Error in recovery logic:', e);
        try {
            localStorage.clear();
            sessionStorage.clear();
        } catch (e2) {
            // hopeless
        }
    }
};
