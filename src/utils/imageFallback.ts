import type { SyntheticEvent } from 'react';

export const fallbackImage =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="900" height="1100" viewBox="0 0 900 1100"%3E%3Crect width="900" height="1100" fill="%23fffaf6"/%3E%3Ccircle cx="450" cy="445" r="132" fill="%23f8e8e3" stroke="%23b76e79" stroke-width="10"/%3E%3Ccircle cx="450" cy="445" r="52" fill="none" stroke="%23b78b3e" stroke-width="10"/%3E%3Ctext x="450" y="655" text-anchor="middle" font-family="Georgia,serif" font-size="56" font-weight="700" fill="%232b2528"%3EBornil Vibes%3C/text%3E%3Ctext x="450" y="715" text-anchor="middle" font-family="Arial,sans-serif" font-size="24" fill="%23b76e79"%3EJewelry Collection%3C/text%3E%3C/svg%3E';

export function handleImageError(event: SyntheticEvent<HTMLImageElement>) {
  event.currentTarget.src = fallbackImage;
}
