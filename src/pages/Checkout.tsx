import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { z } from 'zod';
import { createOrder } from '../services/orderService';
import { selectCartTotal, useCartStore } from '../store/cartStore';
import { trackBeginCheckout, trackPurchase } from '../utils/analytics';
import { formatPrice } from '../utils/format';

const checkoutSchema = z.object({
  customerName: z.string().min(2, 'Name is required'),
  phone: z.string().regex(/^01[0-9]{9}$/, 'Use a valid Bangladesh phone number'),
  address: z.string().min(8, 'Full delivery address is required'),
  paymentMethod: z.literal('cash_on_delivery'),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

export default function Checkout() {
  const navigate = useNavigate();
  const { items, clearCart } = useCartStore();
  const total = selectCartTotal(items);
  const { register, handleSubmit, formState: { errors } } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { paymentMethod: 'cash_on_delivery' },
  });

  const mutation = useMutation({
    mutationFn: createOrder,
    onSuccess: (order) => {
      trackPurchase(items, order.totalAmount, order._id);
      clearCart();
      toast.success('Order placed successfully');
      navigate('/products');
    },
    onError: () => toast.error('Could not place order. Check your backend API.'),
  });

  // Fire InitiateCheckout / begin_checkout once when the checkout page opens with items.
  useEffect(() => {
    if (items.length) trackBeginCheckout(items, total);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = (values: CheckoutForm) => {
    mutation.mutate({
      ...values,
      items: items.map(({ product, quantity }) => ({ productId: product._id, quantity })),
    });
  };

  const DELIVERY = 120;

  return (
    <section className="container-pad grid gap-8 py-12 lg:grid-cols-[1fr_380px]">
      <form onSubmit={handleSubmit(onSubmit)} className="rounded-4xl border border-roseGold/10 bg-white/90 p-6 shadow-soft backdrop-blur-sm sm:p-8">
        <p className="eyebrow mb-2">Almost there</p>
        <h1 className="font-display text-4xl font-bold">Checkout</h1>
        <p className="mt-1 text-sm text-ink/50">Enter your delivery details — pay with cash when it arrives.</p>
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
            <label className="label">Address</label>
            <textarea className="field min-h-32" {...register('address')} />
            {errors.address ? <p className="mt-1 text-sm text-red-500">{errors.address.message}</p> : null}
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
              <span>{product.name} <span className="text-ink/40">× {quantity}</span></span>
              <span className="font-bold text-ink">{formatPrice(product.price * quantity)}</span>
            </div>
          ))}
        </div>
        <div className="mt-5 space-y-2 border-t border-roseGold/10 pt-4 text-sm text-ink/70">
          <div className="flex justify-between"><span>Subtotal</span><span className="font-bold text-ink">{formatPrice(total)}</span></div>
          <div className="flex justify-between"><span>Delivery</span><span className="font-bold text-ink">{formatPrice(items.length ? DELIVERY : 0)}</span></div>
        </div>
        <div className="mt-3 flex items-baseline justify-between border-t border-roseGold/10 pt-4">
          <span className="font-bold">Total</span>
          <span className="text-2xl font-extrabold text-gilded">{formatPrice(total + DELIVERY)}</span>
        </div>
      </aside>
    </section>
  );
}
