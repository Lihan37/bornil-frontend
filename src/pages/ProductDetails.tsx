import { Minus, Plus, ShoppingBag } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import ErrorState from '../components/ErrorState';
import LoadingState from '../components/LoadingState';
import { getProduct } from '../services/productService';
import { useCartStore } from '../store/cartStore';
import { formatPrice } from '../utils/format';
import { handleImageError } from '../utils/imageFallback';

export default function ProductDetails() {
  const { id = '' } = useParams();
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const addItem = useCartStore((state) => state.addItem);
  const { data: product, isLoading, isError } = useQuery({ queryKey: ['product', id], queryFn: () => getProduct(id), enabled: Boolean(id) });

  if (isLoading) return <section className="container-pad py-10"><LoadingState /></section>;
  if (isError || !product) return <section className="container-pad py-10"><ErrorState message="Product not found." /></section>;

  const images = product.images.length ? product.images : [product.images[0]];

  const handleAdd = () => {
    addItem(product, quantity);
    toast.success(`${quantity} ${product.name} added to cart`);
  };

  return (
    <section className="container-pad grid gap-10 py-10 lg:grid-cols-[1fr_0.9fr]">
      <div>
        <div className="overflow-hidden rounded-[2rem] bg-blush">
          <img src={images[activeImage]} alt={product.name} onError={handleImageError} className="aspect-square w-full object-cover" />
        </div>
        <div className="mt-4 flex gap-3 overflow-x-auto">
          {images.map((image, index) => (
            <button key={image} onClick={() => setActiveImage(index)} className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl border-2 border-transparent bg-white data-[active=true]:border-roseGold" data-active={activeImage === index} type="button">
              <img src={image} alt={`${product.name} ${index + 1}`} onError={handleImageError} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-[2rem] border border-roseGold/10 bg-white p-6 shadow-sm lg:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-roseGold">{product.category}</p>
        <h1 className="mt-3 font-display text-4xl font-bold leading-tight">{product.name}</h1>
        <p className="mt-4 text-3xl font-extrabold">{formatPrice(product.price)}</p>
        <p className="mt-5 leading-7 text-ink/65">{product.description}</p>

        <dl className="mt-7 grid gap-4 rounded-3xl bg-pearl p-5 sm:grid-cols-2">
          {[
            ['Material', product.material],
            ['Color', product.color],
            ['Size', product.size],
            ['Stock', product.stock > 0 ? `${product.stock} available` : 'Out of stock'],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs font-bold uppercase tracking-[0.2em] text-ink/40">{label}</dt>
              <dd className="mt-1 font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-7 flex flex-wrap items-center gap-4">
          <div className="flex items-center rounded-full border border-roseGold/20 bg-white">
            <button className="grid h-12 w-12 place-items-center" onClick={() => setQuantity((value) => Math.max(1, value - 1))} type="button" aria-label="Decrease quantity">
              <Minus size={16} />
            </button>
            <span className="min-w-10 text-center font-bold">{quantity}</span>
            <button className="grid h-12 w-12 place-items-center" onClick={() => setQuantity((value) => Math.min(product.stock || value + 1, value + 1))} type="button" aria-label="Increase quantity">
              <Plus size={16} />
            </button>
          </div>
          <button onClick={handleAdd} disabled={product.stock === 0} className="btn-primary disabled:cursor-not-allowed disabled:bg-ink/30" type="button">
            <ShoppingBag size={18} /> Add to cart
          </button>
        </div>
      </div>
    </section>
  );
}
