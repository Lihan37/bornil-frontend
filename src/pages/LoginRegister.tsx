import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { z } from 'zod';
import { login, register as registerUser } from '../services/authService';
import { useAuthStore } from '../store/authStore';

const authSchema = z.object({
  name: z.string().optional(),
  phone: z.string().regex(/^01[0-9]{9}$/, 'Use a valid Bangladesh phone number'),
  email: z.string().email('Enter a valid email').optional().or(z.literal('')),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type AuthForm = z.infer<typeof authSchema>;

export default function LoginRegister() {
  const location = useLocation();
  const [mode, setMode] = useState<'login' | 'register'>(location.pathname === '/signup' ? 'register' : 'login');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const { register, handleSubmit, formState: { errors } } = useForm<AuthForm>({ resolver: zodResolver(authSchema) });

  const mutation = useMutation({
    mutationFn: (values: AuthForm) =>
      mode === 'login'
        ? login({ phone: values.phone, password: values.password })
        : registerUser({ name: values.name || '', phone: values.phone, email: values.email || undefined, password: values.password }),
    onSuccess: (data) => {
      setAuth(data.token, data.user);
      toast.success(mode === 'login' ? 'Logged in successfully' : 'Account created');
      navigate(data.user.role === 'admin' ? '/admin' : '/');
    },
    onError: (error) => {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || 'Authentication failed. Check your backend API and credentials.'
        : 'Authentication failed. Check your backend API and credentials.';
      toast.error(message);
      if (message.toLowerCase().includes('already exists')) {
        setMode('login');
      }
    },
  });

  return (
    <section className="container-pad grid min-h-[70vh] place-items-center py-12">
      <div className="animate-fade-scale w-full max-w-md rounded-[2rem] border border-roseGold/10 bg-white/90 p-7 shadow-lux backdrop-blur-sm sm:p-8">
        <p className="eyebrow">Bornil Vibes</p>
        <h1 className="mt-3 font-display text-4xl font-bold">{mode === 'login' ? 'Welcome back' : 'Create account'}</h1>
        <p className="mt-2 text-sm text-ink/55">{mode === 'login' ? 'Sign in to continue to your account.' : 'Join us for early access to one-of-one drops.'}</p>
        <div className="relative mt-6 grid grid-cols-2 rounded-full bg-pearl p-1">
          <span className={`absolute top-1 bottom-1 w-[calc(50%-0.25rem)] rounded-full bg-ink shadow-soft transition-transform duration-300 ${mode === 'register' ? 'translate-x-full' : 'translate-x-0'}`} />
          <button className={`relative z-10 rounded-full px-4 py-2 text-sm font-bold transition-colors ${mode === 'login' ? 'text-white' : 'text-ink/60'}`} onClick={() => setMode('login')} type="button">Login</button>
          <button className={`relative z-10 rounded-full px-4 py-2 text-sm font-bold transition-colors ${mode === 'register' ? 'text-white' : 'text-ink/60'}`} onClick={() => setMode('register')} type="button">Register</button>
        </div>
        <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className="mt-6 grid gap-4">
          {mode === 'register' ? (
            <div>
              <label className="label">Name</label>
              <input className="field" {...register('name')} />
            </div>
          ) : null}
          <div>
            <label className="label">Phone</label>
            <input className="field" {...register('phone')} />
            {errors.phone ? <p className="mt-1 text-sm text-red-500">{errors.phone.message}</p> : null}
          </div>
          {mode === 'register' ? (
            <div>
              <label className="label">Email optional</label>
              <input className="field" type="email" {...register('email')} />
              {errors.email ? <p className="mt-1 text-sm text-red-500">{errors.email.message}</p> : null}
            </div>
          ) : null}
          <div>
            <label className="label">Password</label>
            <div className="relative">
              <input className="field pr-12" type={showPassword ? 'text' : 'password'} {...register('password')} />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-ink/55 transition hover:bg-pearl hover:text-roseGold"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
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
