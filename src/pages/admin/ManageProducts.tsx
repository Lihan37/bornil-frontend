import { ChevronLeft, ChevronRight, Pencil, Search, Trash2 } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { FormEvent, useEffect, useState } from 'react';
import { toast } from 'sonner';
import AdminShell from './AdminShell';
import ConfirmDialog from '../../components/ConfirmDialog';
import LoadingState from '../../components/LoadingState';
import { getCategories } from '../../services/categoryService';
import { deleteProduct, getAdminProducts, updateProduct } from '../../services/productService';
import type { Product } from '../../types';
import { formatPrice } from '../../utils/format';
import { handleImageError } from '../../utils/imageFallback';
import { productImage } from '../../utils/productImage';

export default function ManageProducts() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [files, setFiles] = useState<FileList | null>(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [availability, setAvailability] = useState('');
  const [status, setStatus] = useState('all');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const { data, isLoading } = useQuery({
    queryKey: ['products', 'admin-manage', { search, category, availability, status, sort, page, pageSize }],
    queryFn: () => getAdminProducts({ search: search || undefined, category: category || undefined, availability: availability || undefined, status, sort, page, limit: pageSize }),
  });
  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: getCategories });
  const products = data?.products || [];
  const meta = data?.meta;
  useEffect(() => setPage(1), [search, category, availability, status, sort, pageSize]);
  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product deleted');
      setDeleteTarget(null);
    },
    onError: () => toast.error('Could not delete product. Check your backend API.'),
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, formData }: { id: string; formData: FormData }) => updateProduct(id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product updated');
      setEditing(null);
      setFiles(null);
    },
    onError: (error) => {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || 'Could not update product. Please try again.'
        : 'Could not update product. Please try again.';
      toast.error(message);
    },
  });


  const handleEditSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editing) return;
    const form = new FormData(event.currentTarget);
    form.set('existingImages', JSON.stringify(editing.images));
    if (files) {
      if (Array.from(files).some((file) => file.size > 8 * 1024 * 1024)) {
        toast.error('Each image must be 8MB or smaller');
        return;
      }
      Array.from(files).forEach((file) => form.append('images', file));
    }
    updateMutation.mutate({ id: editing._id, formData: form });
  };

  return (
    <AdminShell title="Manage products">
      <div className="mb-5 grid gap-3 rounded-3xl border border-roseGold/10 bg-white/90 p-4 shadow-[0_18px_40px_-32px_rgba(74,40,48,0.45)] sm:grid-cols-2 xl:grid-cols-6">
        <label className="sm:col-span-2 xl:col-span-2">
          <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-ink/45"><Search size={15} /> Search</span>
          <input className="field" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Product name or category" />
        </label>
        <label>
          <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-ink/45">Category</span>
          <select className="field" value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="">All categories</option>
            {categories.map((item) => <option key={item._id} value={item.name}>{item.name}</option>)}
          </select>
        </label>
        <label>
          <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-ink/45">Stock</span>
          <select className="field" value={availability} onChange={(event) => setAvailability(event.target.value)}>
            <option value="">All stock</option>
            <option value="in-stock">In stock</option>
            <option value="out-of-stock">Out of stock</option>
          </select>
        </label>
        <label>
          <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-ink/45">Status</span>
          <select className="field" value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </label>
        <label>
          <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-ink/45">Sort</span>
          <select className="field" value={sort} onChange={(event) => setSort(event.target.value)}>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="price-low-high">Price: low to high</option>
            <option value="price-high-low">Price: high to low</option>
            <option value="stock-low-high">Stock: low to high</option>
          </select>
        </label>
      </div>
      <div className="mb-3 flex flex-col gap-2 text-sm text-ink/55 sm:flex-row sm:items-center sm:justify-between">
        <p>Showing {products.length} of {meta?.total ?? 0} products</p>
        <select className="field w-full sm:w-36" value={pageSize} onChange={(event) => setPageSize(Number(event.target.value))}>
          {[10, 20, 50, 100].map((size) => <option key={size} value={size}>{size} / page</option>)}
        </select>
      </div>
      {isLoading ? <LoadingState label="Loading products…" /> : null}
      <div className="grid gap-4">
        {products.map((product) => (
          <div key={product._id} className="grid gap-4 rounded-3xl border border-roseGold/10 bg-white/90 p-4 shadow-[0_18px_40px_-30px_rgba(74,40,48,0.5)] backdrop-blur-sm transition hover:border-roseGold/25 md:grid-cols-[96px_1fr_auto] md:items-center">
            <img src={productImage(product)} alt={product.name} onError={handleImageError} className="h-24 w-24 rounded-2xl object-cover" />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-roseGold">{product.category}</p>
                {product.isFeatured ? <span className="badge-gold">Featured</span> : null}
                {product.isBestSelling ? <span className="badge-ink">Best seller</span> : null}
              </div>
              <h2 className="mt-1 font-display text-2xl font-bold">{product.name}</h2>
              <p className="mt-1 text-sm text-ink/60">
                {formatPrice(product.price)} · <span className={product.stock > 0 ? 'text-emerald-600' : 'text-red-500'}>{product.stock} stock</span>
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEditing(product)} className="grid h-11 w-11 place-items-center rounded-full bg-pearl text-ink transition hover:bg-blush hover:text-roseGold" type="button" aria-label="Edit product">
                <Pencil size={17} />
              </button>
              <button onClick={() => setDeleteTarget(product)} className="grid h-11 w-11 place-items-center rounded-full bg-red-50 text-red-500 transition hover:bg-red-100" type="button" aria-label="Delete product">
                <Trash2 size={17} />
              </button>
            </div>
          </div>
        ))}
        {!isLoading && !products.length ? <p className="rounded-3xl border border-roseGold/10 bg-white/80 p-8 text-center text-ink/55">No products match these filters.</p> : null}
      </div>
      {(meta?.totalPages ?? 0) > 1 ? (
        <div className="mt-5 flex items-center justify-between rounded-2xl border border-roseGold/10 bg-white/80 p-3">
          <p className="text-sm text-ink/55">Page {meta?.page} of {meta?.totalPages}</p>
          <div className="flex items-center gap-2">
            <button className="grid h-10 w-10 place-items-center rounded-full border border-roseGold/20 disabled:opacity-40" type="button" disabled={page <= 1} onClick={() => setPage((current) => current - 1)} aria-label="Previous page"><ChevronLeft size={18} /></button>
            <button className="grid h-10 w-10 place-items-center rounded-full border border-roseGold/20 disabled:opacity-40" type="button" disabled={page >= (meta?.totalPages ?? 1)} onClick={() => setPage((current) => current + 1)} aria-label="Next page"><ChevronRight size={18} /></button>
          </div>
        </div>
      ) : null}
      {editing ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-ink/60 p-4 backdrop-blur-sm">
          <form onSubmit={handleEditSubmit} className="animate-fade-scale mx-auto my-8 max-w-3xl rounded-4xl border border-white/60 bg-white p-6 shadow-lux sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow">Edit product</p>
                <h2 className="mt-1 font-display text-3xl font-bold">{editing.name}</h2>
              </div>
              <button type="button" onClick={() => setEditing(null)} className="rounded-full bg-pearl px-4 py-2 text-sm font-bold transition hover:bg-blush hover:text-roseGold">Close</button>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <input className="field" name="name" defaultValue={editing.name} required />
              <input className="field" name="price" type="number" defaultValue={editing.price} required />
              <select className="field" name="category" defaultValue={editing.category}>
                {categories.map((category) => <option key={category._id} value={category.name}>{category.name}</option>)}
              </select>
              <input className="field" name="stock" type="number" defaultValue={editing.stock} required />
              <input className="field" name="material" defaultValue={editing.material} required />
              <input className="field" name="color" defaultValue={editing.color} required />
              <input className="field" name="size" defaultValue={editing.size} placeholder="Size (optional)" />
              <select className="field" name="status" defaultValue={editing.status}>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
              <textarea className="field min-h-32 md:col-span-2" name="description" defaultValue={editing.description} required />
              <input className="field md:col-span-2" type="file" accept="image/*" multiple onChange={(event) => setFiles(event.target.files)} />
              <label className="flex items-center gap-3 rounded-2xl bg-pearl p-4 text-sm font-bold">
                <input type="hidden" name="isFeatured" value="false" />
                <input name="isFeatured" value="true" type="checkbox" defaultChecked={editing.isFeatured} /> Featured
              </label>
              <label className="flex items-center gap-3 rounded-2xl bg-pearl p-4 text-sm font-bold">
                <input type="hidden" name="isBestSelling" value="false" />
                <input name="isBestSelling" value="true" type="checkbox" defaultChecked={editing.isBestSelling} /> Best selling
              </label>
            </div>
            <button className="btn-primary mt-6" disabled={updateMutation.isPending} type="submit">{updateMutation.isPending ? 'Saving...' : 'Save product'}</button>
          </form>
        </div>
      ) : null}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete product?"
        message={deleteTarget ? `"${deleteTarget.name}" will be permanently removed. This cannot be undone.` : ''}
        confirmLabel="Delete"
        loading={deleteMutation.isPending}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget._id)}
        onCancel={() => setDeleteTarget(null)}
      />
    </AdminShell>
  );
}
