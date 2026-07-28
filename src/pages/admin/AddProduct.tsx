import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import type { ReactNode } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';
import AdminShell from './AdminShell';
import { getCategories } from '../../services/categoryService';
import { createProduct } from '../../services/productService';

const productSchema = z.object({
  name: z.string().min(2),
  price: z.coerce.number().min(1),
  category: z.string().min(2, 'Category is required'),
  description: z.string().min(10),
  images: z
    .custom<FileList>((files) => files instanceof FileList && files.length > 0, 'At least one image is required')
    .refine((files) => files.length <= 6, 'You can upload at most 6 images')
    .refine((files) => Array.from(files).every((file) => file.size <= 8 * 1024 * 1024), 'Each image must be 8MB or smaller'),
  material: z.string().min(2),
  color: z.string().min(2),
  size: z.string().optional(),
  stock: z.coerce.number().min(0),
  isFeatured: z.boolean().optional(),
  isBestSelling: z.boolean().optional(),
});

type ProductForm = z.infer<typeof productSchema>;

export default function AddProduct() {
  const queryClient = useQueryClient();
  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: getCategories });
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProductForm>({ resolver: zodResolver(productSchema) });
  const mutation = useMutation({
    mutationFn: (values: ProductForm) => {
      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        if (key !== 'images' && value !== undefined) formData.append(key, String(value));
      });
      Array.from(values.images).forEach((file) => formData.append('images', file));
      return createProduct(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product added');
      reset();
    },
    onError: (error) => {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || 'Could not add product. Please try again.'
        : 'Could not add product. Please try again.';
      toast.error(message);
    },
  });

  return (
    <AdminShell title="Add product">
      <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className="rounded-4xl border border-roseGold/10 bg-white/90 p-6 shadow-soft backdrop-blur-sm sm:p-8">
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Product name" error={errors.name?.message}><input className="field" {...register('name')} /></Field>
          <Field label="Price" error={errors.price?.message}><input className="field" type="number" {...register('price')} /></Field>
          <Field label="Category" error={errors.category?.message}>
            <select className="field" {...register('category')}>
              {categories.map((category) => <option key={category._id} value={category.name}>{category.name}</option>)}
            </select>
          </Field>
          <Field label="Product images" error={errors.images?.message}><input className="field" type="file" accept="image/*" multiple {...register('images')} /></Field>
          <Field label="Material" error={errors.material?.message}><input className="field" {...register('material')} /></Field>
          <Field label="Color" error={errors.color?.message}><input className="field" {...register('color')} /></Field>
          <Field label="Size (optional)" error={errors.size?.message}><input className="field" {...register('size')} /></Field>
          <Field label="Stock" error={errors.stock?.message}><input className="field" type="number" {...register('stock')} /></Field>
          <div className="md:col-span-2">
            <Field label="Description" error={errors.description?.message}><textarea className="field min-h-32" {...register('description')} /></Field>
          </div>
          <label className="flex items-center gap-3 rounded-2xl bg-pearl p-4 text-sm font-bold"><input type="checkbox" {...register('isFeatured')} /> Featured</label>
          <label className="flex items-center gap-3 rounded-2xl bg-pearl p-4 text-sm font-bold"><input type="checkbox" {...register('isBestSelling')} /> Best selling</label>
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
