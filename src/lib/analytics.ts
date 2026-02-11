// Analytics Utility
// Tracks page views and user events

interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  timestamp: string;
}

class Analytics {
  private isEnabled = true; // Can be controlled via env variable
  private userId: string | null = null;

  init(userId?: string) {
    this.userId = userId || null;
  }

  track(event: string, properties?: Record<string, any>) {
    if (!this.isEnabled) return;

    const analyticsEvent: AnalyticsEvent = {
      event,
      properties: {
        ...properties,
        userId: this.userId,
        url: typeof window !== 'undefined' ? window.location.href : '',
        timestamp: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    };

    // Log to console in development
    if (import.meta.env.DEV) {
      console.log('Analytics Event:', analyticsEvent);
    }

    // Store events in localStorage (last 50 events)
    if (typeof window !== 'undefined') {
      try {
        const storedEvents = JSON.parse(
          localStorage.getItem('analytics_events') || '[]'
        ) as AnalyticsEvent[];
        storedEvents.push(analyticsEvent);
        const recentEvents = storedEvents.slice(-50);
        localStorage.setItem('analytics_events', JSON.stringify(recentEvents));
      } catch (e) {
        // Ignore localStorage errors
      }
    }

    // Send to analytics service (Google Analytics, etc.)
    this.sendToService(analyticsEvent);
  }

  pageView(path: string) {
    this.track('page_view', { path });
  }

  productView(productId: string, productName: string) {
    this.track('product_view', { productId, productName });
  }

  addToCart(productId: string, productName: string, quantity: number) {
    this.track('add_to_cart', { productId, productName, quantity });
  }

  purchase(orderId: string, amount: number, items: number) {
    this.track('purchase', { orderId, amount, items });
  }

  search(query: string) {
    this.track('search', { query });
  }

  private sendToService(event: AnalyticsEvent) {
    // Example: Send to Google Analytics
    // You can integrate with any analytics service here
    
    // Google Analytics 4 example:
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', event.event, event.properties);
    }

    // Or send to your own analytics endpoint:
    // fetch('/api/analytics', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(event),
    // }).catch(() => {
    //   // Ignore errors
    // });
  }

  getStoredEvents(): AnalyticsEvent[] {
    if (typeof window === 'undefined') return [];
    try {
      return JSON.parse(localStorage.getItem('analytics_events') || '[]') as AnalyticsEvent[];
    } catch {
      return [];
    }
  }

  clearStoredEvents() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('analytics_events');
    }
  }
}

export const analytics = new Analytics();

