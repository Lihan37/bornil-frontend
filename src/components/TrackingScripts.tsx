import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { getTrackingSettings } from '../services/settingsService';

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fbq?: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _fbq?: any;
  }
}

/** Google Tag Manager — the recommended path; Pixel & GA4 fire from GTM tags. */
function injectGTM(id: string) {
  if (!id || document.getElementById('bornil-gtm')) return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
  const script = document.createElement('script');
  script.id = 'bornil-gtm';
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(id)}`;
  document.head.appendChild(script);
}

/** Meta (Facebook) Pixel — only used when an admin sets it directly (no GTM). */
function injectMetaPixel(id: string) {
  if (!id || window.fbq) return;
  /* Standard Meta Pixel bootstrap. */
  const f = window as Window & typeof globalThis;
  const n: any = (f.fbq = function (...args: unknown[]) {
    n.callMethod ? n.callMethod.apply(n, args) : n.queue.push(args);
  });
  if (!f._fbq) f._fbq = n;
  n.push = n;
  n.loaded = true;
  n.version = '2.0';
  n.queue = [];
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://connect.facebook.net/en_US/fbevents.js';
  document.head.appendChild(script);
  window.fbq('init', id);
  window.fbq('track', 'PageView');
}

/** GA4 via gtag — only used when an admin sets it directly (no GTM). */
function injectGA4(id: string) {
  if (!id || document.getElementById('bornil-ga4')) return;
  const script = document.createElement('script');
  script.id = 'bornil-ga4';
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
  document.head.appendChild(script);
  window.dataLayer = window.dataLayer || [];
  const gtag = (...args: unknown[]) => window.dataLayer!.push(args as unknown as Record<string, unknown>);
  gtag('js', new Date());
  gtag('config', id);
}

/**
 * Loads GTM / Meta Pixel / GA4 based on the IDs saved by an admin in
 * Tracking Settings — so the IDs can change without a code deploy.
 * Renders nothing.
 */
export default function TrackingScripts() {
  const { data } = useQuery({
    queryKey: ['tracking-settings'],
    queryFn: getTrackingSettings,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (!data) return;
    injectGTM((data.gtmId || '').trim());
    injectMetaPixel((data.metaPixelId || '').trim());
    injectGA4((data.ga4Id || '').trim());
  }, [data]);

  return null;
}
