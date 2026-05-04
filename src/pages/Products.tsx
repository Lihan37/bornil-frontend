import { Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ErrorState from '../components/ErrorState';
import LoadingState from '../components/LoadingState';
import ProductCard from '../components/ProductCard';
import SectionHeader from '../components/SectionHeader';
import { categories } from '../data/mockData';
import { getProducts } from '../services/productService';
import type { ProductFilters } from '../types';

export default function Products() {
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState<ProductFilters>({
    category: searchParams.get('category') || '',
    sort: 'newest',
  });

  const queryKey = useMemo(() => ['products', filters], [filters]);
  const { data: products = [], isLoading, isError } = useQuery({ queryKey, queryFn: () => getProducts(filters) });

  const updateFilter = (key: keyof ProductFilters, value: string) => setFilters((current) => ({ ...current, [key]: value }));

  return (
    <section className="container-pad py-10">
      <SectionHeader eyebrow="Collection" title="All jewelry" description="Search, sort, and filter the Bornil Vibes catalog by category, price, and stock availability." />

      <div className="mb-8 rounded-[2rem] border border-roseGold/10 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <label className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/40" size={18} />
            <input className="field pl-11" placeholder="Search product name" value={filters.search || ''} onChange={(event) => updateFilter('search', event.target.value)} />
          </label>
          <select className="field" value={filters.category || ''} onChange={(event) => updateFilter('category', event.target.value)}>
            <option value="">All categories</option>
            {categories.map((category) => <option key={category} value={category}>{category}</option>)}
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

      {isLoading ? <LoadingState /> : null}
      {isError ? <ErrorState message="Could not load products from API." /> : null}
      {!isLoading && !products.length ? <ErrorState message="No products matched your filters." /> : null}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => <ProductCard key={product._id} product={product} />)}
      </div>
    </section>
  );
}
