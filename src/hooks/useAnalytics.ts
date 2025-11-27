import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '@/lib/analytics';

// Type untuk gtag event parameters
interface GtagEvent {
  event_category: string;
  event_label?: string;
  value?: number;
  transport_type?: string;
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

// Custom hook untuk tracking page views otomatis
export const useAnalytics = () => {
  const location = useLocation();

  useEffect(() => {
    // Track page view setiap kali route berubah
    trackPageView(location.pathname + location.search);
  }, [location]);
};

// Hook untuk tracking events
export const useTrackEvent = () => {
  return {
    trackButtonClick: (buttonName: string) => {
      if (typeof window !== 'undefined' && (window as WindowWithGtag).gtag) {
        (window as WindowWithGtag).gtag('event', 'click', {
          event_category: 'Button',
          event_label: buttonName,
        });
      }
    },
    trackFormSubmit: (formName: string) => {
      if (typeof window !== 'undefined' && (window as WindowWithGtag).gtag) {
        (window as WindowWithGtag).gtag('event', 'form_submit', {
          event_category: 'Form',
          event_label: formName,
        });
      }
    },
    trackDownload: (fileName: string) => {
      if (typeof window !== 'undefined' && (window as WindowWithGtag).gtag) {
        (window as WindowWithGtag).gtag('event', 'file_download', {
          event_category: 'Download',
          event_label: fileName,
        });
      }
    },
    trackOutboundLink: (url: string) => {
      if (typeof window !== 'undefined' && (window as WindowWithGtag).gtag) {
        (window as WindowWithGtag).gtag('event', 'click', {
          event_category: 'Outbound Link',
          event_label: url,
          transport_type: 'beacon',
        });
      }
    },
  };
};