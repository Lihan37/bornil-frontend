import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { getTrackingSettings } from '../services/settingsService';

type Fbq = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[][];
  push: Fbq;
  loaded: boolean;
  version: string;
};

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
    fbq?: Fbq;
    _fbq?: Fbq;
  }
}

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

function injectMetaPixel(id: string) {
  if (!id || window.fbq) return;
  const fbq = function (...args: unknown[]) {
    if (fbq.callMethod) fbq.callMethod(...args);
    else fbq.queue.push(args);
  } as Fbq;

  window.fbq = fbq;
  if (!window._fbq) window._fbq = fbq;
  fbq.push = fbq;
  fbq.loaded = true;
  fbq.version = '2.0';
  fbq.queue = [];

  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://connect.facebook.net/en_US/fbevents.js';
  document.head.appendChild(script);
  window.fbq('init', id);
  window.fbq('track', 'PageView');
}

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

export default function TrackingScripts() {
  const { data } = useQuery({
    queryKey: ['tracking-settings'],
    queryFn: getTrackingSettings,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (!data) return;
    const gtmId = (data.gtmId || '').trim();
    injectGTM(gtmId);
    if (!gtmId) {
      injectMetaPixel((data.metaPixelId || '').trim());
      injectGA4((data.ga4Id || '').trim());
    }
  }, [data]);

  return null;
}
