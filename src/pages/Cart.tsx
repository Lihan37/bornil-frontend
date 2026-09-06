import { ArrowRight, Minus, Plus, ShieldCheck, ShoppingBag, Trash2, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCartStore, selectCartTotal } from '../store/cartStore';
import { formatPrice } from '../utils/format';
import { handleImageError } from '../utils/imageFallback';
import { productImage } from '../utils/productImage';


export default function Cart() {
  const { items, updateQuantity, removeItem } = useCartStore();
  const total = selectCartTotal(items);

  if (!items.length) {
    return (
      <section className="container-pad grid min-h-[55vh] place-items-center py-12">
        <div className="max-w-lg text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-blush text-roseGold">
            <ShoppingBag size={26} />
          </div>
          <h1 className="mt-5 font-display text-4xl font-bold">Your cart is empty</h1>
          <p className="mt-3 text-ink/60">Add your favorite Bornil Vibes pieces before checkout - each one is the only of its kind.</p>
          <Link to="/products" className="btn-gold mt-6">Shop products <ArrowRight size={16} /></Link>
        </div>
      </section>
    );
  }

  return (
    <section className="container-pad grid gap-8 py-12 lg:grid-cols-[1fr_360px]">
      <div>
        <p className="eyebrow mb-2">Your bag</p>
        <h1 className="font-display text-4xl font-bold">Shopping cart</h1>
        <p className="mt-1 text-sm text-ink/50">{items.length} {items.length === 1 ? 'item' : 'items'}</p>

        <div className="mt-6 grid gap-4">
          {items.map(({ product, quantity }) => (
            <div key={product._id} className="grid gap-4 rounded-3xl border border-roseGold/10 bg-white/90 p-4 shadow-[0_18px_40px_-30px_rgba(74,40,48,0.5)] backdrop-blur-sm transition hover:border-roseGold/25 sm:grid-cols-[110px_1fr_auto] sm:items-center">
              <Link to={`/products/${product._id}`} className="overflow-hidden rounded-2xl bg-blush">
                <img src={productImage(product)} alt={product.name} onError={handleImageError} className="h-32 w-full object-cover transition duration-500 hover:scale-105 sm:h-28" />
              </Link>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-roseGold">{product.category}</p>
                <Link to={`/products/${product._id}`} className="mt-1 block font-display text-xl font-bold leading-tight transition hover:text-roseGold">{product.name}</Link>
                <p className="mt-1 text-sm text-ink/55">{formatPrice(product.price)} each</p>
                <p className="mt-1 font-extrabold">{formatPrice(product.price * quantity)}</p>
              </div>
              <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                <div className="flex items-center rounded-full border border-roseGold/20 bg-white">
                  <button className="grid h-10 w-10 place-items-center rounded-full transition hover:text-roseGold" onClick={() => updateQuantity(product._id, quantity - 1)} type="button" aria-label="Decrease"><Minus size={15} /></button>
                  <span className="min-w-8 text-center font-bold">{quantity}</span>
                  <button className="grid h-10 w-10 place-items-center rounded-full transition hover:text-roseGold" onClick={() => updateQuantity(product._id, quantity + 1)} type="button" aria-label="Increase"><Plus size={15} /></button>
                </div>
                <button onClick={() => removeItem(product._id)} className="grid h-10 w-10 place-items-center rounded-full bg-red-50 text-red-500 transition hover:bg-red-100" type="button" aria-label="Remove item">
                  <Trash2 size={17} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <Link to="/products" className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-roseGold transition hover:gap-2.5">
          Continue shopping <ArrowRight size={15} />
        </Link>
      </div>

      <aside className="h-fit rounded-4xl border border-roseGold/10 bg-white/90 p-6 shadow-soft backdrop-blur-sm lg:sticky lg:top-28">
        <h2 className="font-display text-2xl font-bold">Order summary</h2>
        <div className="mt-6 space-y-3 text-sm">
          <div className="flex justify-between text-ink/70"><span>Subtotal</span><span className="font-bold text-ink">{formatPrice(total)}</span></div>
          <div className="flex justify-between text-ink/70"><span>Delivery</span><span className="font-bold text-ink">Choose at checkout</span></div>
          <div className="my-2 hairline" />
          <div className="flex items-baseline justify-between">
            <span className="font-bold">Total</span>
            <span className="text-2xl font-extrabold text-gilded">{formatPrice(total)}</span>
          </div>
        </div>
        <Link to="/checkout" className="btn-primary mt-6 w-full">Proceed to checkout <ArrowRight size={16} /></Link>
        <div className="mt-6 grid gap-2.5 border-t border-roseGold/10 pt-5 text-xs text-ink/60">
          <p className="flex items-center gap-2"><Truck size={15} className="text-roseGold" /> Nationwide delivery</p>
          <p className="flex items-center gap-2"><ShieldCheck size={15} className="text-roseGold" /> Cash on delivery available</p>
        </div>
      </aside>
    </section>
  );
}
