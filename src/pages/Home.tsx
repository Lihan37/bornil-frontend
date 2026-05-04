import { ArrowRight, Gem, ShieldCheck, Truck } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import SectionHeader from '../components/SectionHeader';
import { categories } from '../data/mockData';
import { getProducts } from '../services/productService';
import { handleImageError } from '../utils/imageFallback';

export default function Home() {
  const { data: products = [] } = useQuery({ queryKey: ['products', 'home'], queryFn: () => getProducts({ sort: 'newest' }) });
  const featured = products.filter((product) => product.featured).slice(0, 4);
  const bestSelling = products.filter((product) => product.bestSelling).slice(0, 4);
  const arrivals = [...products].slice(0, 4);

  return (
    <>
      <section className="container-pad py-8 sm:py-12">
        <div className="grid items-center gap-8 rounded-[2rem] border border-roseGold/10 bg-white p-5 shadow-soft md:grid-cols-[1.05fr_0.95fr] md:p-8">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-roseGold">Soft gold, bridal glow, everyday sparkle</p>
            <h1 className="mt-4 font-display text-4xl font-extrabold leading-tight text-ink sm:text-5xl lg:text-6xl">
              Elegant jewelry for every Bornil Vibes moment.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-ink/65">
              Discover earrings, necklaces, rings, bangles, anklets, hair accessories, and bridal sets curated for a premium feminine wardrobe.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/products" className="btn-primary">View all products <ArrowRight size={17} /></Link>
              <Link to="/products?category=Bridal%20Jewelry" className="btn-secondary">Explore bridal</Link>
            </div>
          </div>
          <div className="relative min-h-[340px] overflow-hidden rounded-[1.6rem] bg-blush">
            <img
              src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1200&q=80"
              alt="Bornil Vibes jewelry collection"
              onError={handleImageError}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute bottom-4 left-4 right-4 rounded-3xl bg-white/88 p-4 backdrop-blur">
              <p className="font-display text-2xl font-bold">New bridal edit</p>
              <p className="mt-1 text-sm text-ink/65">Pearls, antique gold, and statement details.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="container-pad py-10">
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { icon: Gem, title: 'Premium Finish', text: 'Rose-gold and antique-gold accents.' },
            { icon: Truck, title: 'Fast Delivery', text: 'Reliable delivery across Bangladesh.' },
            { icon: ShieldCheck, title: 'Secure Checkout', text: 'JWT-ready flow with protected checkout.' },
          ].map((item) => (
            <div key={item.title} className="rounded-3xl border border-roseGold/10 bg-white p-5">
              <item.icon className="text-roseGold" size={24} />
              <h3 className="mt-4 font-bold">{item.title}</h3>
              <p className="mt-1 text-sm text-ink/60">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-pad py-10">
        <SectionHeader eyebrow="Categories" title="Shop by jewelry style" description="Choose your favorite category and find pieces that match your outfit, event, and mood." />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {categories.map((category) => (
            <Link key={category} to={`/products?category=${encodeURIComponent(category)}`} className="rounded-3xl border border-roseGold/10 bg-white p-5 font-display text-xl font-bold transition hover:border-roseGold hover:text-roseGold">
              {category}
            </Link>
          ))}
        </div>
      </section>

      <section className="container-pad py-10">
        <SectionHeader eyebrow="Featured" title="Selected category pieces" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((product) => <ProductCard key={product._id} product={product} />)}
        </div>
      </section>

      <section className="container-pad py-10">
        <SectionHeader eyebrow="Fresh Edit" title="New arrivals" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {arrivals.map((product) => <ProductCard key={product._id} product={product} />)}
        </div>
      </section>

      <section className="container-pad py-10">
        <SectionHeader eyebrow="Loved" title="Best selling jewelry" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {bestSelling.map((product) => <ProductCard key={product._id} product={product} />)}
        </div>
      </section>
    </>
  );
}
