import { ShieldCheck, ShieldX, Trash2 } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import AdminShell from './AdminShell';
import ConfirmDialog from '../../components/ConfirmDialog';
import LoadingState from '../../components/LoadingState';
import { deleteUser, getAdminUsers, updateUserStatus } from '../../services/userService';
import { useAuthStore } from '../../store/authStore';

export default function ManageUsers() {
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((state) => state.user);
  const [deleteTarget, setDeleteTarget] = useState<{ _id: string; name: string } | null>(null);
  const { data: users = [], isLoading } = useQuery({ queryKey: ['admin-users'], queryFn: getAdminUsers });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'active' | 'blocked' }) => updateUserStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User status updated');
    },
    onError: () => toast.error('Could not update user status'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User deleted');
      setDeleteTarget(null);
    },
    onError: () => toast.error('Could not delete user'),
  });

  return (
    <AdminShell title="Users">
      {isLoading ? <LoadingState label="Loading users…" /> : null}
      <div className="grid gap-4">
        {users.map((user) => {
          const isSelf = user._id === currentUser?._id;
          const status = user.status || 'active';
          return (
            <article key={user._id} className="rounded-3xl border border-roseGold/10 bg-white/90 p-4 shadow-[0_18px_40px_-30px_rgba(74,40,48,0.5)] backdrop-blur-sm transition hover:border-roseGold/25">
              <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr_auto] lg:items-center">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="truncate font-display text-2xl font-bold">{user.name}</h2>
                    <span className={user.role === 'admin' ? 'rounded-full bg-ink px-3 py-1 text-xs font-bold text-white' : 'rounded-full bg-pearl px-3 py-1 text-xs font-bold text-roseGold'}>
                      {user.role}
                    </span>
                    <span className={status === 'blocked' ? 'rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-600' : 'rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700'}>
                      {status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-ink/60">{user.phone}</p>
                  {user.email ? <p className="mt-1 truncate text-sm text-ink/60">{user.email}</p> : null}
                </div>
                <div className="text-sm text-ink/60 lg:text-right">
                  <p>Joined</p>
                  <p className="font-bold text-ink">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div className="flex flex-wrap gap-2 lg:justify-end">
                  <button
                    type="button"
                    disabled={isSelf || statusMutation.isPending}
                    onClick={() => statusMutation.mutate({ id: user._id, status: status === 'blocked' ? 'active' : 'blocked' })}
                    className="inline-flex items-center gap-2 rounded-full bg-pearl px-4 py-2 text-sm font-bold text-ink transition hover:text-roseGold disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {status === 'blocked' ? <ShieldCheck size={16} /> : <ShieldX size={16} />}
                    {status === 'blocked' ? 'Unblock' : 'Block'}
                  </button>
                  <button
                    type="button"
                    disabled={isSelf || deleteMutation.isPending}
                    onClick={() => setDeleteTarget({ _id: user._id, name: user.name })}
                    className="inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-2 text-sm font-bold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete user?"
        message={deleteTarget ? `${deleteTarget.name}'s account will be permanently deleted. This cannot be undone.` : ''}
        confirmLabel="Delete"
        loading={deleteMutation.isPending}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget._id)}
        onCancel={() => setDeleteTarget(null)}
      />
    </AdminShell>
  );
}
