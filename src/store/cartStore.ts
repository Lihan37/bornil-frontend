import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, Product } from '../types';

type CartState = {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (product, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((item) => item.product._id === product._id);
          if (existing) {
            return {
              items: state.items.map((item) =>
                item.product._id === product._id
                  ? { ...item, quantity: Math.min(item.quantity + quantity, product.stock || item.quantity + quantity) }
                  : item,
              ),
            };
          }
          return { items: [...state.items, { product, quantity }] };
        }),
      updateQuantity: (productId, quantity) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.product._id === productId ? { ...item, quantity: Math.max(1, quantity) } : item,
          ),
        })),
      removeItem: (productId) => set((state) => ({ items: state.items.filter((item) => item.product._id !== productId) })),
      clearCart: () => set({ items: [] }),
    }),
    { name: 'bornil-vibes-cart' },
  ),
);

export const selectCartCount = (items: CartItem[]) => items.reduce((sum, item) => sum + item.quantity, 0);
export const selectCartTotal = (items: CartItem[]) => items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
