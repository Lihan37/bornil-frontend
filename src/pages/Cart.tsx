import { Minus, Plus, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCartStore, selectCartTotal } from '../store/cartStore';
import { formatPrice } from '../utils/format';
import { handleImageError } from '../utils/imageFallback';

export default function Cart() {
  const { items, updateQuantity, removeItem } = useCartStore();
  const total = selectCartTotal(items);

  if (!items.length) {
    return (
      <section className="container-pad grid min-h-[55vh] place-items-center py-10">
        <div className="max-w-lg text-center">
          <h1 className="font-display text-4xl font-bold">Your cart is empty</h1>
          <p className="mt-3 text-ink/60">Add your favorite Bornil Vibes jewelry pieces before checkout.</p>
          <Link to="/products" className="btn-primary mt-6">Shop products</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="container-pad grid gap-8 py-10 lg:grid-cols-[1fr_360px]">
      <div>
        <h1 className="font-display text-4xl font-bold">Shopping cart</h1>
        <div className="mt-6 grid gap-4">
          {items.map(({ product, quantity }) => (
            <div key={product._id} className="grid gap-4 rounded-3xl border border-roseGold/10 bg-white p-4 shadow-sm sm:grid-cols-[120px_1fr_auto] sm:items-center">
              <img src={product.images[0]} alt={product.name} onError={handleImageError} className="h-32 w-full rounded-2xl object-cover sm:h-28" />
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-roseGold">{product.category}</p>
                <h2 className="mt-1 font-display text-2xl font-bold">{product.name}</h2>
                <p className="mt-1 font-bold">{formatPrice(product.price)}</p>
              </div>
              <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                <div className="flex items-center rounded-full border border-roseGold/20">
                  <button className="grid h-10 w-10 place-items-center" onClick={() => updateQuantity(product._id, quantity - 1)} type="button"><Minus size={15} /></button>
                  <span className="min-w-8 text-center font-bold">{quantity}</span>
                  <button className="grid h-10 w-10 place-items-center" onClick={() => updateQuantity(product._id, quantity + 1)} type="button"><Plus size={15} /></button>
                </div>
                <button onClick={() => removeItem(product._id)} className="grid h-10 w-10 place-items-center rounded-full bg-red-50 text-red-500" type="button" aria-label="Remove item">
                  <Trash2 size={17} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <aside className="h-fit rounded-[2rem] border border-roseGold/10 bg-white p-6 shadow-soft">
        <h2 className="font-display text-3xl font-bold">Order summary</h2>
        <div className="mt-6 space-y-3 text-sm">
          <div className="flex justify-between"><span>Subtotal</span><span className="font-bold">{formatPrice(total)}</span></div>
          <div className="flex justify-between"><span>Delivery</span><span className="font-bold">{formatPrice(total > 0 ? 120 : 0)}</span></div>
          <div className="border-t border-roseGold/10 pt-3 text-lg font-extrabold flex justify-between"><span>Total</span><span>{formatPrice(total + 120)}</span></div>
        </div>
        <Link to="/checkout" className="btn-primary mt-6 w-full">Proceed to checkout</Link>
      </aside>
    </section>
  );
}
