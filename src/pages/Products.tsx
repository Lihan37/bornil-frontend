import { Search, SlidersHorizontal } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ErrorState from '../components/ErrorState';
import { ProductGridSkeleton } from '../components/LoadingState';
import ProductCard from '../components/ProductCard';
import SectionHeader from '../components/SectionHeader';
import { getCategories } from '../services/categoryService';
import { getProducts } from '../services/productService';
import type { ProductFilters } from '../types';

export default function Products() {
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState<ProductFilters>({
    category: searchParams.get('category') || '',
    sort: 'newest',
  });

  const queryKey = useMemo(() => ['products', filters], [filters]);
  const { data, isLoading, isError } = useQuery({ queryKey, queryFn: () => getProducts({ ...filters, limit: 12 }) });
  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: getCategories });
  const products = data?.products || [];

  const updateFilter = (key: keyof ProductFilters, value: string) => setFilters((current) => ({ ...current, [key]: value }));

  return (
    <section className="container-pad py-12">
      <SectionHeader eyebrow="Collection" title="All jewelry" description="Search, sort, and filter the Bornil Vibes catalog by category, price, and stock availability." />

      <div className="mb-8 rounded-[2rem] border border-roseGold/10 bg-white/85 p-5 shadow-soft backdrop-blur-sm">
        <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-ink/40">
          <SlidersHorizontal size={14} /> Filter & sort
        </div>
        <div className="grid gap-3 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <label className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/40" size={18} />
            <input className="field pl-11" placeholder="Search product name" value={filters.search || ''} onChange={(event) => updateFilter('search', event.target.value)} />
          </label>
          <select className="field" value={filters.category || ''} onChange={(event) => updateFilter('category', event.target.value)}>
            <option value="">All categories</option>
            {categories.map((category) => <option key={category._id} value={category.name}>{category.name}</option>)}
          </select>
          <select className="field" value={filters.availability || ''} onChange={(event) => updateFilter('availability', event.target.value)}>
            <option value="">Any availability</option>
            <option value="in-stock">In stock</option>
            <option value="out-of-stock">Out of stock</option>
          </select>
          <select className="field" value={filters.sort || ''} onChange={(event) => updateFilter('sort', event.target.value)}>
            <option value="newest">Newest</option>
            <option value="price-low-high">Price low-high</option>
            <option value="price-high-low">Price high-low</option>
          </select>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <input className="field" type="number" min="0" placeholder="Min price" value={filters.minPrice || ''} onChange={(event) => updateFilter('minPrice', event.target.value)} />
          <input className="field" type="number" min="0" placeholder="Max price" value={filters.maxPrice || ''} onChange={(event) => updateFilter('maxPrice', event.target.value)} />
        </div>
      </div>

      {!isLoading && !isError && products.length ? (
        <p className="mb-5 text-sm text-ink/50">
          Showing <span className="font-bold text-ink">{products.length}</span> {products.length === 1 ? 'piece' : 'pieces'}
          {data?.meta ? <> of {data.meta.total}</> : null}
        </p>
      ) : null}

      {isLoading ? <ProductGridSkeleton count={8} /> : null}
      {isError ? <ErrorState message="Could not load products from the store right now. Please try again." /> : null}
      {!isLoading && !isError && !products.length ? <ErrorState message="No products matched your filters. Try clearing a filter or two." /> : null}

      {!isLoading && products.length ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => <ProductCard key={product._id} product={product} />)}
        </div>
      ) : null}

      {data?.meta && data.meta.totalPages > 1 ? (
        <div className="mt-10 flex justify-center gap-2">
          {Array.from({ length: data.meta.totalPages }, (_, index) => index + 1).map((page) => {
            const active = filters.page === page || (!filters.page && page === 1);
            return (
              <button
                key={page}
                type="button"
                onClick={() => setFilters((current) => ({ ...current, page }))}
                className={
                  active
                    ? 'h-11 min-w-11 rounded-full bg-ink px-3 font-bold text-white shadow-soft'
                    : 'h-11 min-w-11 rounded-full border border-roseGold/15 bg-white px-3 font-bold text-ink/70 transition hover:border-roseGold hover:text-roseGold'
                }
              >
                {page}
              </button>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
