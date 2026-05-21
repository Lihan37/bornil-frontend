import { Pencil, Trash2 } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FormEvent, useState } from 'react';
import { toast } from 'sonner';
import AdminShell from './AdminShell';
import LoadingState from '../../components/LoadingState';
import { getCategories } from '../../services/categoryService';
import { deleteProduct, getProducts, updateProduct } from '../../services/productService';
import type { Product } from '../../types';
import { formatPrice } from '../../utils/format';
import { handleImageError } from '../../utils/imageFallback';
import { productImage } from '../../utils/productImage';

export default function ManageProducts() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Product | null>(null);
  const [files, setFiles] = useState<FileList | null>(null);
  const { data, isLoading } = useQuery({ queryKey: ['products', 'admin-manage'], queryFn: () => getProducts({ limit: 48 }) });
  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: getCategories });
  const products = data?.products || [];
  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product deleted');
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
    onError: () => toast.error('Could not update product. Check your backend API.'),
  });

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this product?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleEditSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editing) return;
    const form = new FormData(event.currentTarget);
    form.set('existingImages', JSON.stringify(editing.images));
    if (files) Array.from(files).forEach((file) => form.append('images', file));
    updateMutation.mutate({ id: editing._id, formData: form });
  };

  return (
    <AdminShell title="Manage products">
      {isLoading ? <LoadingState /> : null}
      <div className="grid gap-4">
        {products.map((product) => (
          <div key={product._id} className="grid gap-4 rounded-3xl border border-roseGold/10 bg-white p-4 shadow-sm md:grid-cols-[96px_1fr_auto] md:items-center">
            <img src={productImage(product)} alt={product.name} onError={handleImageError} className="h-24 w-24 rounded-2xl object-cover" />
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-roseGold">{product.category}</p>
              <h2 className="font-display text-2xl font-bold">{product.name}</h2>
              <p className="mt-1 text-sm text-ink/60">{formatPrice(product.price)} · {product.stock} stock</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEditing(product)} className="grid h-11 w-11 place-items-center rounded-full bg-pearl text-ink" type="button" aria-label="Edit product">
                <Pencil size={17} />
              </button>
              <button onClick={() => handleDelete(product._id)} className="grid h-11 w-11 place-items-center rounded-full bg-red-50 text-red-500" type="button" aria-label="Delete product">
                <Trash2 size={17} />
              </button>
            </div>
          </div>
        ))}
      </div>
      {editing ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-ink/50 p-4">
          <form onSubmit={handleEditSubmit} className="mx-auto my-8 max-w-3xl rounded-[2rem] bg-white p-6 shadow-soft">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-roseGold">Edit product</p>
                <h2 className="font-display text-3xl font-bold">{editing.name}</h2>
              </div>
              <button type="button" onClick={() => setEditing(null)} className="rounded-full bg-pearl px-4 py-2 text-sm font-bold">Close</button>
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
              <input className="field" name="size" defaultValue={editing.size} required />
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
    </AdminShell>
  );
}
