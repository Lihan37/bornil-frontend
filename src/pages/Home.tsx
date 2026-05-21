import { ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import SectionHeader from '../components/SectionHeader';
import { getCategories } from '../services/categoryService';
import { getProducts } from '../services/productService';
import { handleImageError } from '../utils/imageFallback';

export default function Home() {
  const { data } = useQuery({ queryKey: ['products', 'home'], queryFn: () => getProducts({ sort: 'newest', limit: 8 }) });
  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: getCategories });
  const products = data?.products || [];
  const featured = products.filter((product) => product.isFeatured).slice(0, 4);
  const bestSelling = products.filter((product) => product.isBestSelling).slice(0, 4);
  const arrivals = products.slice(0, 4);

  return (
    <>
      <section className="relative isolate min-h-[calc(100vh-5rem)] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=2400&q=85"
          alt="Bornil Vibes jewelry collection"
          onError={handleImageError}
          className="absolute inset-0 -z-20 h-full w-full object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-ink/55" />
        <div className="container-pad flex min-h-[calc(100vh-5rem)] items-center justify-center py-16 text-center">
          <div className="mx-auto max-w-4xl">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-champagne">Soft gold, bridal glow, everyday sparkle</p>
            <h1 className="mt-4 font-display text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-7xl">
              Elegant jewelry for every Bornil Vibes moment.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-white/85">
              Discover earrings, necklaces, rings, bangles, anklets, hair accessories, and bridal sets curated for a premium feminine wardrobe.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/products" className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-ink transition hover:bg-champagne">
                View all products <ArrowRight size={17} />
              </Link>
              <Link to="/products?category=Bridal%20Jewelry" className="inline-flex items-center justify-center rounded-full border border-white/60 bg-white/10 px-5 py-3 text-sm font-bold text-white backdrop-blur transition hover:bg-white hover:text-ink">
                Explore bridal
              </Link>
            </div>
            <div className="mx-auto mt-10 max-w-xl rounded-3xl bg-white/88 p-4 text-left text-ink backdrop-blur sm:text-center">
              <p className="font-display text-2xl font-bold">New bridal edit</p>
              <p className="mt-1 text-sm text-ink/65">Pearls, antique gold, and statement details.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="container-pad py-10">
        <SectionHeader eyebrow="Categories" title="Shop by jewelry style" description="Choose your favorite category and find pieces that match your outfit, event, and mood." />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {categories.filter((category) => category.isFeatured).slice(0, 8).map((category) => (
            <Link key={category._id} to={`/products?category=${encodeURIComponent(category.name)}`} className="rounded-3xl border border-roseGold/10 bg-white p-5 font-display text-xl font-bold transition hover:border-roseGold hover:text-roseGold">
              {category.name}
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
