import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Eye, EyeOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { z } from 'zod';
import { createOrder } from '../services/orderService';
import { useAuthStore } from '../store/authStore';
import { selectCartTotal, useCartStore } from '../store/cartStore';
import { trackBeginCheckout, trackPurchase } from '../utils/analytics';
import { formatPrice } from '../utils/format';

const deliveryCharges = {
  inside_dhaka: 70,
  outside_dhaka: 130,
} as const;

const deliveryAreaLabels = {
  inside_dhaka: 'Inside Dhaka',
  outside_dhaka: 'Outside Dhaka',
} as const;

const checkoutSchema = z.object({
  customerName: z.string().min(2, 'Name is required'),
  phone: z.string().regex(/^01[0-9]{9}$/, 'Use a valid Bangladesh phone number'),
  email: z.string().email('Enter a valid email').optional().or(z.literal('')),
  password: z.string().optional(),
  address: z.string().min(8, 'Full delivery address is required'),
  deliveryArea: z.enum(['inside_dhaka', 'outside_dhaka']),
  paymentMethod: z.literal('cash_on_delivery'),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

export default function Checkout() {
  const navigate = useNavigate();
  const authUser = useAuthStore((state) => state.user);
  const setAuth = useAuthStore((state) => state.setAuth);
  const { items, clearCart } = useCartStore();
  const [showPassword, setShowPassword] = useState(false);
  const subtotal = selectCartTotal(items);
  const { register, handleSubmit, watch, formState: { errors } } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: authUser?.name || '',
      phone: authUser?.phone || '',
      email: authUser?.email || '',
      deliveryArea: 'inside_dhaka',
      paymentMethod: 'cash_on_delivery',
    },
  });
  const deliveryArea = watch('deliveryArea');
  const deliveryCharge = items.length ? deliveryCharges[deliveryArea] : 0;
  const grandTotal = subtotal + deliveryCharge;

  const mutation = useMutation({
    mutationFn: createOrder,
    onSuccess: ({ order, auth }) => {
      if (auth) setAuth(auth.token, auth.user);
      const value = typeof order?.totalAmount === 'number' ? order.totalAmount : grandTotal;
      trackPurchase(items, value, order?._id);
      clearCart();
      toast.success(auth ? 'Order placed and account created' : 'Order placed successfully');
      navigate(auth ? '/dashboard/orders' : '/products');
    },
    onError: () => toast.error('Could not place order. Check your backend API.'),
  });

  useEffect(() => {
    if (items.length) trackBeginCheckout(items, grandTotal);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = (values: CheckoutForm) => {
    if (!authUser && (!values.password || values.password.length < 6)) {
      toast.error('Set a password so your account can be created with this order');
      return;
    }

    mutation.mutate({
      ...values,
      email: values.email || undefined,
      password: authUser ? undefined : values.password,
      items: items.map(({ product, quantity }) => ({ productId: product._id, quantity })),
    });
  };

  return (
    <section className="container-pad grid gap-8 py-12 lg:grid-cols-[1fr_380px]">
      <form onSubmit={handleSubmit(onSubmit)} className="rounded-4xl border border-roseGold/10 bg-white/90 p-6 shadow-soft backdrop-blur-sm sm:p-8">
        <p className="eyebrow mb-2">Almost there</p>
        <h1 className="font-display text-4xl font-bold">Checkout</h1>
        <p className="mt-1 text-sm text-ink/50">Enter delivery details - no login required.</p>
        {!authUser ? <p className="mt-3 rounded-2xl bg-blush px-4 py-3 text-sm text-ink/70">We will create your account from this order so you can login later with your phone and password.</p> : null}
        <div className="mt-6 grid gap-5">
          <div>
            <label className="label">Customer name</label>
            <input className="field" {...register('customerName')} />
            {errors.customerName ? <p className="mt-1 text-sm text-red-500">{errors.customerName.message}</p> : null}
          </div>
          <div>
            <label className="label">Phone</label>
            <input className="field" {...register('phone')} />
            {errors.phone ? <p className="mt-1 text-sm text-red-500">{errors.phone.message}</p> : null}
          </div>
          <div>
            <label className="label">Email optional</label>
            <input className="field" type="email" {...register('email')} />
            {errors.email ? <p className="mt-1 text-sm text-red-500">{errors.email.message}</p> : null}
          </div>
          {!authUser ? (
            <div>
              <label className="label">Create account password</label>
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
              <p className="mt-1 text-xs text-ink/45">Use this with your phone number to login later.</p>
            </div>
          ) : null}
          <div>
            <label className="label">Address</label>
            <textarea className="field min-h-32" {...register('address')} />
            {errors.address ? <p className="mt-1 text-sm text-red-500">{errors.address.message}</p> : null}
          </div>
          <div>
            <label className="label">Delivery area</label>
            <select className="field" {...register('deliveryArea')}>
              <option value="inside_dhaka">Inside Dhaka - BDT 70</option>
              <option value="outside_dhaka">Outside Dhaka - BDT 130</option>
            </select>
          </div>
          <div>
            <label className="label">Payment method</label>
            <select className="field" {...register('paymentMethod')}>
              <option value="cash_on_delivery">Cash on delivery</option>
            </select>
          </div>
        </div>
        <button disabled={!items.length || mutation.isPending} className="btn-primary mt-6 w-full disabled:bg-ink/30" type="submit">
          {mutation.isPending ? 'Placing order...' : 'Place order'}
        </button>
      </form>

      <aside className="h-fit rounded-4xl border border-roseGold/10 bg-white/90 p-6 shadow-soft backdrop-blur-sm lg:sticky lg:top-28">
        <h2 className="font-display text-2xl font-bold">Your items</h2>
        <div className="mt-5 space-y-3.5">
          {items.map(({ product, quantity }) => (
            <div key={product._id} className="flex justify-between gap-4 text-sm text-ink/70">
              <span>{product.name} <span className="text-ink/40">x {quantity}</span></span>
              <span className="font-bold text-ink">{formatPrice(product.price * quantity)}</span>
            </div>
          ))}
        </div>
        <div className="mt-5 space-y-2 border-t border-roseGold/10 pt-4 text-sm text-ink/70">
          <div className="flex justify-between"><span>Subtotal</span><span className="font-bold text-ink">{formatPrice(subtotal)}</span></div>
          <div className="flex justify-between"><span>Delivery ({deliveryAreaLabels[deliveryArea]})</span><span className="font-bold text-ink">{formatPrice(deliveryCharge)}</span></div>
        </div>
        <div className="mt-3 flex items-baseline justify-between border-t border-roseGold/10 pt-4">
          <span className="font-bold">Total</span>
          <span className="text-2xl font-extrabold text-gilded">{formatPrice(grandTotal)}</span>
        </div>
      </aside>
    </section>
  );
}