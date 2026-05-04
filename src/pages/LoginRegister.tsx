import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { z } from 'zod';
import { login, register as registerUser } from '../services/authService';
import { useAuthStore } from '../store/authStore';

const authSchema = z.object({
  name: z.string().optional(),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type AuthForm = z.infer<typeof authSchema>;

export default function LoginRegister() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const { register, handleSubmit, formState: { errors } } = useForm<AuthForm>({ resolver: zodResolver(authSchema) });

  const mutation = useMutation({
    mutationFn: (values: AuthForm) => mode === 'login' ? login(values) : registerUser({ name: values.name || '', email: values.email, password: values.password }),
    onSuccess: (data) => {
      setAuth(data.token, data.user);
      toast.success(mode === 'login' ? 'Logged in successfully' : 'Account created');
      navigate(data.user.role === 'admin' ? '/admin' : '/');
    },
    onError: () => toast.error('Authentication failed. Check your backend API and credentials.'),
  });

  return (
    <section className="container-pad grid min-h-[70vh] place-items-center py-10">
      <div className="w-full max-w-md rounded-[2rem] border border-roseGold/10 bg-white p-6 shadow-soft">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-roseGold">Bornil Vibes</p>
        <h1 className="mt-3 font-display text-4xl font-bold">{mode === 'login' ? 'Welcome back' : 'Create account'}</h1>
        <div className="mt-6 grid grid-cols-2 rounded-full bg-pearl p-1">
          <button className={mode === 'login' ? 'rounded-full bg-ink px-4 py-2 text-sm font-bold text-white' : 'px-4 py-2 text-sm font-bold'} onClick={() => setMode('login')} type="button">Login</button>
          <button className={mode === 'register' ? 'rounded-full bg-ink px-4 py-2 text-sm font-bold text-white' : 'px-4 py-2 text-sm font-bold'} onClick={() => setMode('register')} type="button">Register</button>
        </div>
        <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className="mt-6 grid gap-4">
          {mode === 'register' ? (
            <div>
              <label className="label">Name</label>
              <input className="field" {...register('name')} />
            </div>
          ) : null}
          <div>
            <label className="label">Email</label>
            <input className="field" type="email" {...register('email')} />
            {errors.email ? <p className="mt-1 text-sm text-red-500">{errors.email.message}</p> : null}
          </div>
          <div>
            <label className="label">Password</label>
            <input className="field" type="password" {...register('password')} />
            {errors.password ? <p className="mt-1 text-sm text-red-500">{errors.password.message}</p> : null}
          </div>
          <button className="btn-primary mt-2 w-full" disabled={mutation.isPending} type="submit">
            {mutation.isPending ? 'Please wait...' : mode === 'login' ? 'Login' : 'Register'}
          </button>
        </form>
      </div>
    </section>
  );
}
