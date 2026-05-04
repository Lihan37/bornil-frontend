import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import type { ReactNode } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';
import AdminShell from './AdminShell';
import { categories } from '../../data/mockData';
import { createProduct } from '../../services/productService';

const productSchema = z.object({
  name: z.string().min(2),
  price: z.coerce.number().min(1),
  category: z.enum(['Earrings', 'Necklaces', 'Rings', 'Bracelets', 'Bangles', 'Anklets', 'Hair Accessories', 'Bridal Jewelry']),
  description: z.string().min(10),
  imageUrl: z.string().url(),
  material: z.string().min(2),
  color: z.string().min(2),
  size: z.string().min(1),
  stock: z.coerce.number().min(0),
  featured: z.boolean().optional(),
  bestSelling: z.boolean().optional(),
});

type ProductForm = z.infer<typeof productSchema>;

export default function AddProduct() {
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProductForm>({ resolver: zodResolver(productSchema) });
  const mutation = useMutation({
    mutationFn: (values: ProductForm) => createProduct({ ...values, images: [values.imageUrl], createdAt: new Date().toISOString() }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product added');
      reset();
    },
    onError: () => toast.error('Could not add product. Check your backend API.'),
  });

  return (
    <AdminShell title="Add product">
      <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className="rounded-[2rem] border border-roseGold/10 bg-white p-6 shadow-sm">
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Product name" error={errors.name?.message}><input className="field" {...register('name')} /></Field>
          <Field label="Price" error={errors.price?.message}><input className="field" type="number" {...register('price')} /></Field>
          <Field label="Category" error={errors.category?.message}>
            <select className="field" {...register('category')}>
              {categories.map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
          </Field>
          <Field label="Image URL" error={errors.imageUrl?.message}><input className="field" {...register('imageUrl')} /></Field>
          <Field label="Material" error={errors.material?.message}><input className="field" {...register('material')} /></Field>
          <Field label="Color" error={errors.color?.message}><input className="field" {...register('color')} /></Field>
          <Field label="Size" error={errors.size?.message}><input className="field" {...register('size')} /></Field>
          <Field label="Stock" error={errors.stock?.message}><input className="field" type="number" {...register('stock')} /></Field>
          <div className="md:col-span-2">
            <Field label="Description" error={errors.description?.message}><textarea className="field min-h-32" {...register('description')} /></Field>
          </div>
          <label className="flex items-center gap-3 rounded-2xl bg-pearl p-4 text-sm font-bold"><input type="checkbox" {...register('featured')} /> Featured</label>
          <label className="flex items-center gap-3 rounded-2xl bg-pearl p-4 text-sm font-bold"><input type="checkbox" {...register('bestSelling')} /> Best selling</label>
        </div>
        <button className="btn-primary mt-6" disabled={mutation.isPending} type="submit">{mutation.isPending ? 'Saving...' : 'Add product'}</button>
      </form>
    </AdminShell>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
      {error ? <p className="mt-1 text-sm text-red-500">{error}</p> : null}
    </div>
  );
}
