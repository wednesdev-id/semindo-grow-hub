// Google Analytics Measurement ID dari environment variable
export const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX';

// Type untuk gtag event parameters
interface GtagEvent {
  event_category: string;
  event_label?: string;
  value?: number;
  send_to?: string;
  page_path?: string;
  page_title?: string;
  page_location?: string;
}

// Type untuk gtag function
interface GtagFunction {
  (command: 'event', action: string, parameters?: GtagEvent): void;
  (command: 'config', targetId: string, config?: Record<string, unknown>): void;
  (command: 'js', date: Date): void;
  (command: string, ...args: unknown[]): void;
}

// Type untuk window dengan gtag
interface WindowWithGtag extends Window {
  dataLayer: unknown[];
  gtag: GtagFunction;
}

// Declare gtag function type
declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: GtagFunction;
  }
}

// Initialize Google Analytics
export const initGA = () => {
  // Load gtag script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  // Initialize gtag
  window.dataLayer = window.dataLayer || [];
  function gtag(...args: unknown[]) {
    window.dataLayer.push(args);
  }
  
  // Make gtag available globally
  (window as WindowWithGtag).gtag = gtag;
  
  gtag('js', new Date());
  gtag('config', GA_MEASUREMENT_ID, {
    page_title: document.title,
    page_location: window.location.href,
  });
};

// Track page views
export const trackPageView = (url: string, title?: string) => {
  if (typeof window !== 'undefined' && (window as WindowWithGtag).gtag) {
    (window as WindowWithGtag).gtag('config', GA_MEASUREMENT_ID, {
      page_path: url,
      page_title: title || document.title,
      page_location: window.location.href,
    });
  }
};

// Track custom events
export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  if (typeof window !== 'undefined' && (window as WindowWithGtag).gtag) {
    (window as WindowWithGtag).gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Track conversions
export const trackConversion = (conversionId: string, conversionLabel?: string) => {
  if (typeof window !== 'undefined' && (window as WindowWithGtag).gtag) {
    (window as WindowWithGtag).gtag('event', 'conversion', {
      send_to: `${GA_MEASUREMENT_ID}/${conversionId}`,
      event_label: conversionLabel,
    });
  }
};