import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { z } from 'zod';
import { createOrder } from '../services/orderService';
import { selectCartTotal, useCartStore } from '../store/cartStore';
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
    onSuccess: () => {
      clearCart();
      toast.success('Order placed successfully');
      navigate('/products');
    },
    onError: () => toast.error('Could not place order. Check your backend API.'),
  });

  const onSubmit = (values: CheckoutForm) => {
    mutation.mutate({
      ...values,
      items: items.map(({ product, quantity }) => ({ productId: product._id, quantity })),
    });
  };

  return (
    <section className="container-pad grid gap-8 py-10 lg:grid-cols-[1fr_380px]">
      <form onSubmit={handleSubmit(onSubmit)} className="rounded-[2rem] border border-roseGold/10 bg-white p-6 shadow-sm">
        <h1 className="font-display text-4xl font-bold">Checkout</h1>
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

      <aside className="h-fit rounded-[2rem] border border-roseGold/10 bg-white p-6 shadow-soft">
        <h2 className="font-display text-3xl font-bold">Your items</h2>
        <div className="mt-5 space-y-4">
          {items.map(({ product, quantity }) => (
            <div key={product._id} className="flex justify-between gap-4 text-sm">
              <span>{product.name} x {quantity}</span>
              <span className="font-bold">{formatPrice(product.price * quantity)}</span>
            </div>
          ))}
        </div>
        <div className="mt-5 border-t border-roseGold/10 pt-4 text-lg font-extrabold flex justify-between">
          <span>Total</span>
          <span>{formatPrice(total + 120)}</span>
        </div>
      </aside>
    </section>
  );
}
