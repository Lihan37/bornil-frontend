import { ArrowRight, CircleDashed, CircleDot, Disc3, Ear, Flower2, Gem, Link as LinkIcon, Sparkles, Truck, ShieldCheck, type LucideIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { ProductGridSkeleton } from '../components/LoadingState';
import SectionHeader from '../components/SectionHeader';
import { getCategories } from '../services/categoryService';
import { getProducts } from '../services/productService';
import { handleImageError } from '../utils/imageFallback';

const categoryIcons: Record<string, LucideIcon> = {
  Earrings: Ear,
  Necklaces: LinkIcon,
  Rings: CircleDot,
  Bracelets: Sparkles,
  Bangles: Disc3,
  Anklets: CircleDashed,
  'Hair Accessories': Flower2,
};

const perks = [
  { icon: Sparkles, title: 'Handmade', text: 'Crafted by hand, never mass produced' },
  { icon: Gem, title: 'One-of-one', text: 'Every piece is the only one of its kind' },
  { icon: Truck, title: 'Nationwide', text: 'Delivery across Bangladesh' },
  { icon: ShieldCheck, title: 'Cash on delivery', text: 'Pay when it arrives at your door' },
];

export default function Home() {
  const { data, isLoading } = useQuery({ queryKey: ['products', 'home'], queryFn: () => getProducts({ sort: 'newest', limit: 8 }) });
  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: getCategories });
  const products = data?.products || [];
  const featured = products.filter((product) => product.isFeatured).slice(0, 4);
  const bestSelling = products.filter((product) => product.isBestSelling).slice(0, 4);
  const arrivals = products.slice(0, 4);

  const section = (eyebrow: string, title: string, list: typeof products, cta?: { to: string; label: string }) => (
    <section className="container-pad py-12">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeader eyebrow={eyebrow} title={title} />
        {cta ? (
          <Link to={cta.to} className="mb-8 hidden items-center gap-1.5 text-sm font-bold text-roseGold transition hover:gap-2.5 sm:inline-flex">
            {cta.label} <ArrowRight size={16} />
          </Link>
        ) : null}
      </div>
      {isLoading ? <ProductGridSkeleton count={4} /> : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {list.map((product) => <ProductCard key={product._id} product={product} />)}
        </div>
      )}
    </section>
  );

  return (
    <>
      {/* Hero -------------------------------------------------------- */}
      <section className="relative isolate min-h-[calc(100vh-7rem)] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=2400&q=85"
          alt="Bornil Vibes jewelry collection"
          onError={handleImageError}
          className="absolute inset-0 -z-20 h-full w-full animate-ken-burns object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-linear-to-br from-ink/75 via-ink/45 to-roseDeep/40" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_75%_30%,rgba(226,192,136,0.25),transparent_45%)]" />

        <div className="container-pad flex min-h-[calc(100vh-7rem)] items-center py-16">
          <div className="max-w-3xl">
            <p className="animate-rise inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.24em] text-champagne backdrop-blur">
              <Sparkles size={13} className="text-goldLight" /> Everyday sparkle
            </p>
            <h1 className="animate-rise delay-1 mt-6 font-display text-4xl font-extrabold leading-[1.05] text-white sm:text-6xl lg:text-7xl">
              Elegant jewelry for every <span className="text-gilded italic">Bornil</span> moment.
            </h1>
            <p className="animate-rise delay-2 mt-6 max-w-xl text-base leading-8 text-white/85">
              Earrings, necklaces, rings, bangles, anklets, and hair accessories - each piece handcrafted, one-of-one, for a premium feminine wardrobe.
            </p>
            <div className="animate-rise delay-3 mt-9 flex flex-wrap gap-3">
              <Link to="/products" className="btn-gold">
                Shop the collection <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Perks bar -------------------------------------------------- */}
      <section className="border-y border-roseGold/10 bg-white/60">
        <div className="container-pad grid grid-cols-2 gap-6 py-8 lg:grid-cols-4">
          {perks.map((perk) => (
            <div key={perk.title} className="flex items-center gap-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-blush text-roseGold">
                <perk.icon size={19} />
              </div>
              <div>
                <p className="text-sm font-bold text-ink">{perk.title}</p>
                <p className="text-xs leading-5 text-ink/55">{perk.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories ------------------------------------------------- */}
      <section className="container-pad py-14">
        <SectionHeader
          align="center"
          eyebrow="Categories"
          title="Shop by jewelry style"
          description="Find pieces that match your outfit, event, and mood."
        />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {categories.filter((category) => category.isFeatured && category.name !== 'Bridal Jewelry').slice(0, 8).map((category) => {
            const CategoryIcon = categoryIcons[String(category.name)] ?? Gem;

            return (
              <Link
                key={category._id}
                to={`/products?category=${encodeURIComponent(category.name)}`}
                className="group relative overflow-hidden rounded-3xl border border-roseGold/10 bg-white p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:border-roseGold/30 hover:shadow-glow"
              >
                <div className="absolute inset-0 -z-10 bg-linear-to-br from-blush/0 to-blush/0 transition-all duration-500 group-hover:from-blush/40 group-hover:to-champagne/30" />
                <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-blush text-roseGold transition group-hover:scale-110">
                  <CategoryIcon size={21} strokeWidth={1.8} />
                </span>
                <p className="mt-4 font-display text-lg font-bold leading-tight transition-colors group-hover:text-roseGold">{category.name}</p>
              </Link>
            );
          })}
        </div>
      </section>

      {featured.length || isLoading ? section('Featured', 'Selected pieces', featured, { to: '/products', label: 'View all' }) : null}

      {/* Editorial band --------------------------------------------- */}
      <section className="container-pad py-6">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-ink px-6 py-14 text-white sm:px-14">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(183,110,121,0.4),transparent_40%),radial-gradient(circle_at_85%_80%,rgba(226,192,136,0.3),transparent_40%)]" />
          <div className="max-w-2xl">
            <p className="eyebrow text-champagne">The Bornil promise</p>
            <h2 className="mt-4 font-display text-3xl font-bold leading-tight sm:text-4xl">
              When you own a Bornil Vibes piece, you own the only one of its kind in the world.
            </h2>
            <p className="mt-5 leading-8 text-white/70">
              No mass production. Each piece is a labor of love - resin, intricate wire-work, and hand-selected beads, assembled to last.
            </p>
            <Link to="/about" className="mt-7 inline-flex items-center gap-2 rounded-full bg-white/95 px-6 py-3 text-sm font-bold text-ink transition hover:-translate-y-0.5 hover:bg-champagne">
              Our story <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {section('Fresh edit', 'New arrivals', arrivals, { to: '/products?sort=newest', label: 'View all' })}
      {bestSelling.length || isLoading ? section('Loved', 'Best selling jewelry', bestSelling, { to: '/products', label: 'View all' }) : null}
    </>
  );
}
