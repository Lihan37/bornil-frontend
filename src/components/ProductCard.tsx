import { Heart, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useCartStore } from '../store/cartStore';
import type { Product } from '../types';
import { formatPrice } from '../utils/format';
import { handleImageError } from '../utils/imageFallback';

export default function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((state) => state.addItem);
  const isAvailable = product.stock > 0;

  const handleAdd = () => {
    addItem(product, 1);
    toast.success(`${product.name} added to cart`);
  };

  return (
    <article className="group overflow-hidden rounded-3xl border border-roseGold/10 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-soft">
      <Link to={`/products/${product._id}`} className="block overflow-hidden bg-blush">
        <img
          src={product.images[0]}
          alt={product.name}
          onError={handleImageError}
          className="aspect-[4/5] w-full object-cover transition duration-500 group-hover:scale-105"
        />
      </Link>
      <div className="space-y-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-roseGold">{product.category}</p>
            <Link to={`/products/${product._id}`} className="mt-1 block font-display text-xl font-bold leading-tight hover:text-roseGold">
              {product.name}
            </Link>
          </div>
          <button className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-pearl text-roseGold" type="button" aria-label="Save">
            <Heart size={18} />
          </button>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-extrabold">{formatPrice(product.price)}</p>
            <p className={isAvailable ? 'text-xs font-semibold text-emerald-600' : 'text-xs font-semibold text-red-500'}>
              {isAvailable ? `${product.stock} in stock` : 'Out of stock'}
            </p>
          </div>
          <button
            onClick={handleAdd}
            disabled={!isAvailable}
            type="button"
            className="grid h-11 w-11 place-items-center rounded-full bg-ink text-white transition hover:bg-roseGold disabled:cursor-not-allowed disabled:bg-ink/30"
            aria-label="Add to cart"
          >
            <ShoppingBag size={18} />
          </button>
        </div>
      </div>
    </article>
  );
}
