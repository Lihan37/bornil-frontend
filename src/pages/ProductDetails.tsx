import { ChevronRight, Heart, Minus, Plus, ShieldCheck, ShoppingBag, Truck } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import ErrorState from '../components/ErrorState';
import LoadingState from '../components/LoadingState';
import ProductCard from '../components/ProductCard';
import { getProduct, getProducts } from '../services/productService';
import { useCartStore } from '../store/cartStore';
import { trackAddToCart, trackViewItem } from '../utils/analytics';
import { formatPrice } from '../utils/format';
import { handleImageError } from '../utils/imageFallback';
import { productImage } from '../utils/productImage';

export default function ProductDetails() {
  const { id = '' } = useParams();
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const addItem = useCartStore((state) => state.addItem);
  const { data: product, isLoading, isError } = useQuery({ queryKey: ['product', id], queryFn: () => getProduct(id), enabled: Boolean(id) });
  const { data: relatedData } = useQuery({
    queryKey: ['related-products', product?.category, product?._id],
    queryFn: () => getProducts({ category: product!.category, limit: 4 }),
    enabled: Boolean(product?.category),
  });

  // Fire ViewContent / view_item once the product loads.
  useEffect(() => {
    if (product) trackViewItem(product);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?._id]);

  if (isLoading) return <section className="container-pad py-10"><LoadingState /></section>;
  if (isError || !product) return <section className="container-pad py-10"><ErrorState message="Product not found." /></section>;

  const images = product.images.length ? product.images.map((image) => image.url) : [productImage(product)];

  const hasDiscount = Boolean(product.oldPrice && product.oldPrice > product.price);
  const isAvailable = product.stock > 0;

  const handleAdd = () => {
    addItem(product, quantity);
    trackAddToCart(product, quantity);
    toast.success(`${quantity} ${product.name} added to cart`);
  };

  return (
    <section className="container-pad py-10">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1.5 text-xs font-semibold text-ink/45">
        <Link to="/" className="transition hover:text-roseGold">Home</Link>
        <ChevronRight size={13} />
        <Link to="/products" className="transition hover:text-roseGold">Products</Link>
        <ChevronRight size={13} />
        <Link to={`/products?category=${encodeURIComponent(product.category)}`} className="transition hover:text-roseGold">{product.category}</Link>
        <ChevronRight size={13} />
        <span className="truncate text-ink/70">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[1fr_0.9fr]">
        <div className="lg:sticky lg:top-28 lg:self-start">
        <div className="relative overflow-hidden rounded-4xl bg-blush shadow-soft">
          {hasDiscount ? <span className="badge-rose absolute left-4 top-4 z-10">Sale</span> : null}
          <img src={images[activeImage]} alt={product.name} onError={handleImageError} className="aspect-square w-full object-cover transition duration-500" />
        </div>
        {images.length > 1 ? (
          <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
            {images.map((image, index) => (
              <button key={image} onClick={() => setActiveImage(index)} className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl border-2 border-transparent bg-white transition data-[active=true]:border-roseGold data-[active=true]:shadow-soft" data-active={activeImage === index} type="button">
                <img src={image} alt={`${product.name} ${index + 1}`} onError={handleImageError} className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        ) : null}
        </div>

        <div className="rounded-4xl border border-roseGold/10 bg-white/90 p-6 shadow-soft backdrop-blur-sm lg:p-8">
        <p className="eyebrow">{product.category}</p>
        <h1 className="mt-3 font-display text-4xl font-bold leading-tight">{product.name}</h1>
        <div className="mt-4 flex items-end gap-3">
          <p className="text-3xl font-extrabold text-ink">{formatPrice(product.price)}</p>
          {hasDiscount ? <p className="pb-1 text-lg font-semibold text-ink/40 line-through">{formatPrice(product.oldPrice as number)}</p> : null}
        </div>
        <p className={`mt-2 text-sm font-bold ${isAvailable ? 'text-emerald-600' : 'text-red-500'}`}>
          {isAvailable ? (product.stock <= 3 ? `Only ${product.stock} left — almost gone` : 'In stock, ready to ship') : 'Currently out of stock'}
        </p>
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

        <div className="mt-7 flex flex-wrap items-center gap-3">
          <div className="flex items-center rounded-full border border-roseGold/20 bg-white">
            <button className="grid h-12 w-12 place-items-center rounded-full transition hover:text-roseGold" onClick={() => setQuantity((value) => Math.max(1, value - 1))} type="button" aria-label="Decrease quantity">
              <Minus size={16} />
            </button>
            <span className="min-w-10 text-center font-bold">{quantity}</span>
            <button className="grid h-12 w-12 place-items-center rounded-full transition hover:text-roseGold" onClick={() => setQuantity((value) => Math.min(product.stock || value + 1, value + 1))} type="button" aria-label="Increase quantity">
              <Plus size={16} />
            </button>
          </div>
          <button onClick={handleAdd} disabled={!isAvailable} className="btn-primary flex-1 disabled:cursor-not-allowed disabled:bg-ink/30" type="button">
            <ShoppingBag size={18} /> Add to cart
          </button>
          <button type="button" className="grid h-12 w-12 place-items-center rounded-full border border-roseGold/20 bg-white text-roseGold transition hover:bg-blush" aria-label="Save to wishlist">
            <Heart size={18} />
          </button>
        </div>

        <div className="mt-7 grid gap-3 border-t border-roseGold/10 pt-6 sm:grid-cols-2">
          <div className="flex items-center gap-3 text-sm text-ink/65">
            <Truck size={18} className="text-roseGold" /> Nationwide delivery
          </div>
          <div className="flex items-center gap-3 text-sm text-ink/65">
            <ShieldCheck size={18} className="text-roseGold" /> Cash on delivery
          </div>
        </div>
        </div>
      </div>
      {relatedData?.products.length ? (
        <div className="mt-16">
          <h2 className="font-display text-3xl font-bold">Related pieces</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {relatedData.products.filter((item) => item._id !== product._id).slice(0, 4).map((item) => (
              <ProductCard key={item._id} product={item} />
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
