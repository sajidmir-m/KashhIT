import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, storageKey, sessionNamespace } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, phone?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  updatePassword: (password: string) => Promise<{ error: any }>;
  checkEmailAvailable: (email: string) => Promise<boolean>;
  sendSignupOtp: (email: string, fullName?: string, phone?: string, password?: string) => Promise<{ error: any }>;
  verifySignupOtp: (email: string, token: string, password: string, fullName?: string, phone?: string) => Promise<{ error: any }>;
  needsPasswordSetup: boolean;
  signOut: () => Promise<void>;
  signOutSilent: () => Promise<void>;
  userRoles: string[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [needsPasswordSetup, setNeedsPasswordSetup] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Check if user needs password setup (OAuth user without password)
          // Check if user only has OAuth identity (no email/password identity)
          const isOAuthUser = session.user.app_metadata?.provider === 'google';
          const identities = session.user.identities || [];
          const hasEmailIdentity = identities.some((id: any) => id.provider === 'email');
          setNeedsPasswordSetup(isOAuthUser && !hasEmailIdentity && sessionNamespace === 'user');

          // Defer role fetching
          setTimeout(() => {
            fetchUserRoles(session.user.id);
          }, 0);
        } else {
          setUserRoles([]);
          setNeedsPasswordSetup(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      if (session?.user) {
        // Check if user needs password setup
        const isOAuthUser = session.user.app_metadata?.provider === 'google';
        const identities = session.user.identities || [];
        const hasEmailIdentity = identities.some((id: any) => id.provider === 'email');
        setNeedsPasswordSetup(isOAuthUser && !hasEmailIdentity && sessionNamespace === 'user');

        fetchUserRoles(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRoles = async (userId: string) => {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);

    if (error) {
      if (import.meta.env.DEV) {
        console.error('Error fetching roles:', error);
      }
      return;
    }

    setUserRoles(data?.map(r => r.role) || []);
  };

  const signUp = async (email: string, password: string, fullName: string, phone?: string) => {
    // For regular users, don't require email confirmation (set in Supabase dashboard)
    // For vendors/admins, keep email confirmation enabled
    const isRegularUser = sessionNamespace === 'user';
    const redirectUrl = isRegularUser ? undefined : `${window.location.origin}/`;

    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
          phone: phone
        }
      }
    });

    if (error) {
      const message = (error as any)?.message?.toLowerCase?.() || '';
      if (message.includes('rate limit')) {
        toast.error('Too many requests. Please wait a minute before trying again.');
      } else if (message.includes('already') && message.includes('registered')) {
        toast.error('This email is already registered. Please sign in instead.');
        return { error: { ...error, code: 'email_exists' } };
      } else if (message.includes('already') && message.includes('exist')) {
        toast.error('This email is already registered. Please sign in instead.');
        return { error: { ...error, code: 'email_exists' } };
      } else {
        toast.error(error.message);
      }
      return { error };
    }

    // If regular user and session is returned (email confirmation disabled), user is logged in
    if (isRegularUser && data.session) {
      toast.success('Account created successfully!');
    } else if (isRegularUser && data.user && !data.session) {
      // Email confirmation is enabled but user created - try to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        toast.success('Account created successfully! Please log in.');
      } else {
        toast.success('Account created successfully!');
      }
    } else {
      toast.success('Account created successfully! Please check your email to verify your account.');
    }

    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      const message = (error as any)?.message?.toLowerCase?.() || '';
      if (message.includes('confirm') && message.includes('email')) {
        toast.error('Please confirm your email before signing in.');
      } else {
        toast.error('Invalid email or password.');
      }
      return { error };
    }

    toast.success('Welcome back!');
    return { error: null };
  };

  const signInWithGoogle = async () => {
    // Only allow Google OAuth for regular users
    if (sessionNamespace !== 'user') {
      toast.error('Google sign-in is only available for regular users.');
      return { error: { message: 'Google sign-in not available for this account type' } };
    }

    // Use current origin (works in both dev and production)
    const redirectUrl = `${window.location.origin}/auth`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'select_account',
        },
      },
    });

    if (error) {
      toast.error(error.message);
      return { error };
    }

    return { error: null };
  };

  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      toast.error(error.message);
      return { error };
    }

    setNeedsPasswordSetup(false);
    toast.success('Password set successfully!');
    return { error: null };
  };

  // Check if email is available by looking up profile by email (kept in sync via triggers)
  const checkEmailAvailable = async (email: string): Promise<boolean> => {
    const { data, error } = await (supabase as any)
      .from('profiles')
      .select('id')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      if (import.meta.env.DEV) {
        console.error('Email availability check error:', error);
      }
      return false;
    }

    return !data; // available if no profile found
  };

  // Send OTP for signup using custom SMTP edge function - regular users only
  const sendSignupOtp = async (email: string, fullName?: string, phone?: string, password?: string) => {
    if (sessionNamespace !== 'user') {
      return { error: { message: 'OTP signup only for regular users' } };
    }

    if (!password || password.length < 6) {
      toast.error('Password is required');
      return { error: { message: 'Password is required' } };
    }

    // Call custom send-otp edge function to send OTP via SMTP
    try {
      const { data, error: invokeError } = await supabase.functions.invoke('send-otp', {
        body: {
          email: email.trim().toLowerCase(),
          full_name: fullName?.trim() || '',
        },
      });

      if (invokeError) {
        console.error('Error calling send-otp function:', invokeError);
        
        // Check if it's a deployment/network error
        if (invokeError.message?.includes('Failed to send a request') || 
            invokeError.message?.includes('fetch') ||
            invokeError.name === 'FunctionsFetchError') {
          const errorMsg = 'Edge function not available. Please ensure the send-otp function is deployed to Supabase.';
          console.error(errorMsg);
          toast.error('OTP service unavailable. Please contact support.');
          return { error: { message: errorMsg } };
        }
        
        toast.error('Failed to send OTP. Please try again.');
        return { error: { message: invokeError.message || 'Failed to send OTP' } };
      }

      // Handle case where data might be null or undefined
      if (data === null || data === undefined) {
        console.error('send-otp function returned no data');
        toast.error('Failed to send OTP. Please try again.');
        return { error: { message: 'No response from server' } };
      }

      if (!data?.ok) {
        const errorMsg = data?.error || 'Failed to send OTP';
        console.error('send-otp function error:', errorMsg);
        toast.error(errorMsg);
        return { error: { message: errorMsg } };
      }

      toast.success('Verification code sent to your email');
      return { error: null };
    } catch (err: any) {
      console.error('Error sending OTP:', err);
      
      // Provide more specific error messages
      if (err?.message?.includes('Failed to send a request') || 
          err?.message?.includes('fetch') ||
          err?.name === 'FunctionsFetchError') {
        const errorMsg = 'Edge function not available. Please ensure the send-otp function is deployed to Supabase.';
        toast.error('OTP service unavailable. Please contact support.');
        return { error: { message: errorMsg } };
      }
      
      toast.error(err?.message || 'Failed to send OTP. Please try again.');
      return { error: { message: err?.message || 'Failed to send OTP' } };
    }
  };

  // Verify OTP for signup using custom edge function
  const verifySignupOtp = async (email: string, token: string, password: string, fullName?: string, phone?: string) => {
    if (!password || password.length < 6) {
      toast.error('Password is required');
      return { error: { message: 'Password is required' } };
    }

    try {
      const { data, error: invokeError } = await supabase.functions.invoke('verify-otp-signup', {
        body: {
          email: email.trim().toLowerCase(),
          code: token,
          password: password,
          full_name: fullName?.trim() || '',
          phone: phone?.trim() || null,
        },
      });

      if (invokeError) {
        console.error('Error calling verify-otp-signup function:', invokeError);
        toast.error('Failed to verify OTP. Please try again.');
        return { error: { message: invokeError.message || 'Failed to verify OTP' } };
      }

      if (!data?.ok) {
        const errorMsg = data?.error || 'Invalid or expired code';
        console.error('verify-otp-signup function error:', errorMsg);
        toast.error(errorMsg);
        return { error: { message: errorMsg } };
      }

      toast.success('Account created successfully! Please sign in.');
      return { error: null };
    } catch (err: any) {
      console.error('Error verifying OTP:', err);
      toast.error(err?.message || 'Failed to verify OTP. Please try again.');
      return { error: { message: err?.message || 'Failed to verify OTP' } };
    }
  };

  const signOutSilent = async () => {
    try {
      setUser(null);
      setSession(null);
      setUserRoles([]);
      try {
        const { error } = await supabase.auth.signOut();
        if (error && !error.message?.includes('session missing') && !error.message?.includes('Auth session missing')) {
          if (import.meta.env.DEV) {
            console.error('Sign out error:', error);
          }
        }
      } catch (e) {
        // ignore
      }
    } catch (e) {
      // ignore
    }
  };

  const signOut = async () => {
    try {
      // Clear state first to update UI immediately
      setUser(null);
      setSession(null);
      setUserRoles([]);

      // Clear all auth-related storage first
      if (typeof window !== 'undefined' && window?.localStorage) {
        try {
          // Clear Supabase auth storage
          const supabaseStorageKeys = Object.keys(window.localStorage).filter(key =>
            key.startsWith('sb-') || key.includes('supabase') || key === storageKey
          );
          supabaseStorageKeys.forEach(key => {
            try {
              window.localStorage.removeItem(key);
            } catch (e) {
              // Ignore individual storage errors
            }
          });
        } catch (storageError) {
          // Ignore storage errors, continue with logout
        }
      }

      // Try to sign out from Supabase, but don't fail if session is missing
      try {
        const { error } = await supabase.auth.signOut();
        // Ignore session missing errors - user is already logged out
        if (error && !error.message?.includes('session missing') && !error.message?.includes('Auth session missing')) {
          if (import.meta.env.DEV) {
            console.error('Sign out error:', error);
          }
        }
      } catch (signOutError: any) {
        // Ignore AuthSessionMissingError and similar errors - session might already be cleared
        if (!signOutError?.message?.includes('session missing') && !signOutError?.message?.includes('Auth session missing')) {
          if (import.meta.env.DEV) {
            console.error('Sign out error:', signOutError);
          }
        }
      }

      // Navigate to home page
      setTimeout(() => {
        navigate('/');
        toast.success('Logged out successfully');
      }, 100);
    } catch (error) {
      // Even if there's an error, clear state and navigate
      setUser(null);
      setSession(null);
      setUserRoles([]);

      // Clear storage
      try {
        if (typeof window !== 'undefined' && window?.localStorage) {
          const supabaseStorageKeys = Object.keys(window.localStorage).filter(key =>
            key.startsWith('sb-') || key.includes('supabase') || key === storageKey
          );
          supabaseStorageKeys.forEach(key => {
            try {
              window.localStorage.removeItem(key);
            } catch (e) {
              // Ignore
            }
          });
        }
      } catch (e) {
        // Ignore
      }

      navigate('/');
      toast.success('Logged out successfully');
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signUp,
      signIn,
      signInWithGoogle,
      updatePassword,
      checkEmailAvailable,
      sendSignupOtp,
      verifySignupOtp,
      needsPasswordSetup,
      signOutSilent,
      signOut,
      userRoles
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
