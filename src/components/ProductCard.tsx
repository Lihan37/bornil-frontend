import { Eye, Heart, ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useCartStore } from '../store/cartStore';
import type { Product } from '../types';
import { trackAddToCart } from '../utils/analytics';
import { formatPrice } from '../utils/format';
import { handleImageError } from '../utils/imageFallback';
import { productImage } from '../utils/productImage';

export default function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((state) => state.addItem);
  const [saved, setSaved] = useState(false);
  const isAvailable = product.stock > 0;
  const isLowStock = isAvailable && product.stock <= 3;
  const hasDiscount = Boolean(product.oldPrice && product.oldPrice > product.price);
  const discount = hasDiscount ? Math.round((1 - product.price / (product.oldPrice as number)) * 100) : 0;

  const handleAdd = () => {
    addItem(product, 1);
    trackAddToCart(product, 1);
    toast.success(`${product.name} added to cart`);
  };

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-[1.75rem] border border-roseGold/10 bg-white/90 shadow-[0_1px_0_rgba(255,255,255,0.8)_inset,0_18px_40px_-28px_rgba(74,40,48,0.4)] backdrop-blur-sm transition-all duration-500 hover:-translate-y-1.5 hover:border-roseGold/25 hover:shadow-glow">
      <div className="relative overflow-hidden bg-blush">
        <Link to={`/products/${product._id}`} className="block">
          <img
            src={productImage(product)}
            alt={product.name}
            onError={handleImageError}
            className="aspect-4/5 w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />
        </Link>

        {/* Gradient veil on hover */}
        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-ink/45 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        {/* Badges */}
        <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {hasDiscount ? <span className="badge-rose">-{discount}%</span> : null}
          {product.isFeatured ? <span className="badge-gold">Featured</span> : null}
          {product.isBestSelling ? <span className="badge-ink">Best seller</span> : null}
          {!isAvailable ? <span className="badge bg-white/90 text-ink/70 backdrop-blur">Sold out</span> : null}
        </div>

        {/* Wishlist */}
        <button
          onClick={() => {
            setSaved((v) => !v);
            toast[saved ? 'message' : 'success'](saved ? 'Removed from wishlist' : 'Saved to wishlist');
          }}
          className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-white/85 text-roseGold shadow-sm backdrop-blur transition hover:scale-110 hover:bg-white"
          type="button"
          aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
        >
          <Heart size={17} className={saved ? 'fill-roseGold' : ''} />
        </button>

        {/* Quick view on hover */}
        <Link
          to={`/products/${product._id}`}
          className="absolute inset-x-3 bottom-3 flex translate-y-3 items-center justify-center gap-2 rounded-full bg-white/95 py-2.5 text-xs font-bold uppercase tracking-[0.14em] text-ink opacity-0 shadow-soft backdrop-blur transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100"
        >
          <Eye size={15} /> Quick view
        </Link>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-roseGold">{product.category}</p>
          <Link to={`/products/${product._id}`} className="mt-1 block font-display text-lg font-bold leading-tight transition-colors hover:text-roseGold">
            {product.name}
          </Link>
        </div>

        <div className="mt-auto flex items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-lg font-extrabold text-ink">{formatPrice(product.price)}</p>
              {hasDiscount ? <p className="text-sm font-semibold text-ink/40 line-through">{formatPrice(product.oldPrice as number)}</p> : null}
            </div>
            <p className={`mt-0.5 text-xs font-semibold ${!isAvailable ? 'text-red-500' : isLowStock ? 'text-antiqueGold' : 'text-emerald-600'}`}>
              {!isAvailable ? 'Out of stock' : isLowStock ? `Only ${product.stock} left` : 'In stock'}
            </p>
          </div>
          <button
            onClick={handleAdd}
            disabled={!isAvailable}
            type="button"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-ink text-white shadow-[0_10px_24px_-12px_rgba(43,37,40,0.8)] transition-all duration-300 hover:scale-105 hover:bg-roseGold disabled:cursor-not-allowed disabled:bg-ink/25 disabled:shadow-none"
            aria-label="Add to cart"
          >
            <ShoppingBag size={17} />
          </button>
        </div>
      </div>
    </article>
  );
}
