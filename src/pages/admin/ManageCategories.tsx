import { FormEvent, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import AdminShell from './AdminShell';
import ConfirmDialog from '../../components/ConfirmDialog';
import { createCategory, deleteCategory, getCategories, updateCategory, type CategoryRecord } from '../../services/categoryService';

export default function ManageCategories() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<CategoryRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CategoryRecord | null>(null);
  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: getCategories });

  const saveMutation = useMutation({
    mutationFn: (payload: { id?: string; name: string; image?: string; isFeatured: boolean }) =>
      payload.id ? updateCategory(payload.id, payload) : createCategory(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setEditing(null);
      toast.success('Category saved');
    },
    onError: () => toast.error('Could not save category'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category deleted');
      setDeleteTarget(null);
    },
    onError: () => toast.error('Could not delete category'),
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    saveMutation.mutate({
      id: editing?._id,
      name: String(form.get('name') || ''),
      image: String(form.get('image') || '') || undefined,
      isFeatured: form.get('isFeatured') === 'true',
    });
    event.currentTarget.reset();
  };

  return (
    <AdminShell title="Manage categories">
      <form onSubmit={handleSubmit} className="rounded-4xl border border-roseGold/10 bg-white/90 p-5 shadow-soft backdrop-blur-sm">
        <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto_auto]">
          <input className="field" name="name" placeholder="Category name" defaultValue={editing?.name || ''} required />
          <input className="field" name="image" placeholder="Image URL optional" defaultValue={editing?.image || ''} />
          <label className="flex items-center gap-3 rounded-2xl bg-pearl px-4 text-sm font-bold">
            <input type="hidden" name="isFeatured" value="false" />
            <input type="checkbox" name="isFeatured" value="true" defaultChecked={editing?.isFeatured || false} />
            Featured
          </label>
          <button className="btn-primary" type="submit">{editing ? 'Update' : 'Add'}</button>
        </div>
      </form>
      <div className="mt-6 grid gap-3">
        {categories.map((category) => (
          <div key={category._id} className="flex flex-col justify-between gap-3 rounded-3xl border border-roseGold/10 bg-white/90 p-4 shadow-[0_18px_40px_-30px_rgba(74,40,48,0.5)] backdrop-blur-sm transition hover:border-roseGold/25 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-2xl font-bold">{category.name}</h2>
                {category.isFeatured ? <span className="badge-gold">Featured</span> : null}
              </div>
              <p className="text-sm text-ink/55">{category.slug}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEditing(category)} className="btn-secondary py-2" type="button">Edit</button>
              <button onClick={() => setDeleteTarget(category)} className="rounded-full bg-red-50 px-5 py-2 text-sm font-bold text-red-500 transition hover:bg-red-100" type="button">Delete</button>
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete category?"
        message={deleteTarget ? `"${deleteTarget.name}" will be removed. Products in it won't be deleted.` : ''}
        confirmLabel="Delete"
        loading={deleteMutation.isPending}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget._id)}
        onCancel={() => setDeleteTarget(null)}
      />
    </AdminShell>
  );
}
