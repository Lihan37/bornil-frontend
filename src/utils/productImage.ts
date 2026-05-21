import type { Product } from '../types';
import { fallbackImage } from './imageFallback';

export function productImage(product: Product) {
  return product.images[0]?.url || fallbackImage;
}
