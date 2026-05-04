import { Pencil, Trash2 } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import AdminShell from './AdminShell';
import LoadingState from '../../components/LoadingState';
import { deleteProduct, getProducts } from '../../services/productService';
import { formatPrice } from '../../utils/format';
import { handleImageError } from '../../utils/imageFallback';

export default function ManageProducts() {
  const queryClient = useQueryClient();
  const { data: products = [], isLoading } = useQuery({ queryKey: ['products', 'admin-manage'], queryFn: () => getProducts() });
  const mutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product deleted');
    },
    onError: () => toast.error('Could not delete product. Check your backend API.'),
  });

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this product?')) {
      mutation.mutate(id);
    }
  };

  return (
    <AdminShell title="Manage products">
      {isLoading ? <LoadingState /> : null}
      <div className="grid gap-4">
        {products.map((product) => (
          <div key={product._id} className="grid gap-4 rounded-3xl border border-roseGold/10 bg-white p-4 shadow-sm md:grid-cols-[96px_1fr_auto] md:items-center">
            <img src={product.images[0]} alt={product.name} onError={handleImageError} className="h-24 w-24 rounded-2xl object-cover" />
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-roseGold">{product.category}</p>
              <h2 className="font-display text-2xl font-bold">{product.name}</h2>
              <p className="mt-1 text-sm text-ink/60">{formatPrice(product.price)} · {product.stock} stock</p>
            </div>
            <div className="flex gap-2">
              <button className="grid h-11 w-11 place-items-center rounded-full bg-pearl text-ink" type="button" aria-label="Edit product">
                <Pencil size={17} />
              </button>
              <button onClick={() => handleDelete(product._id)} className="grid h-11 w-11 place-items-center rounded-full bg-red-50 text-red-500" type="button" aria-label="Delete product">
                <Trash2 size={17} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
