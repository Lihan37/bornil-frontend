import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { updateMe } from '../services/authService';
import { useAuthStore } from '../store/authStore';

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email().optional().or(z.literal('')),
});

type ProfileForm = z.infer<typeof schema>;

export default function Profile() {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const setAuth = useAuthStore((state) => state.setAuth);
  const { register, handleSubmit, formState: { errors } } = useForm<ProfileForm>({
    resolver: zodResolver(schema),
    defaultValues: { name: user?.name || '', email: user?.email || '' },
  });
  const mutation = useMutation({
    mutationFn: updateMe,
    onSuccess: (updatedUser) => {
      if (token) setAuth(token, updatedUser);
      toast.success('Profile updated');
    },
    onError: () => toast.error('Could not update profile'),
  });

  return (
    <section className="container-pad grid min-h-[60vh] place-items-center py-10">
      <form onSubmit={handleSubmit((values) => mutation.mutate({ name: values.name, email: values.email || undefined }))} className="w-full max-w-xl rounded-[2rem] border border-roseGold/10 bg-white p-6 shadow-soft">
        <h1 className="font-display text-4xl font-bold">Profile</h1>
        <p className="mt-2 text-sm text-ink/60">Phone: {user?.phone}</p>
        <div className="mt-6 grid gap-4">
          <div>
            <label className="label">Name</label>
            <input className="field" {...register('name')} />
            {errors.name ? <p className="mt-1 text-sm text-red-500">{errors.name.message}</p> : null}
          </div>
          <div>
            <label className="label">Email</label>
            <input className="field" {...register('email')} />
            {errors.email ? <p className="mt-1 text-sm text-red-500">{errors.email.message}</p> : null}
          </div>
        </div>
        <button className="btn-primary mt-6" disabled={mutation.isPending} type="submit">Save changes</button>
      </form>
    </section>
  );
}
