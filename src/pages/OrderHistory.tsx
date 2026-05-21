import { useQuery } from '@tanstack/react-query';
import LoadingState from '../components/LoadingState';
import { getMyOrders } from '../services/orderService';
import { formatPrice } from '../utils/format';

export default function OrderHistory() {
  const { data: orders = [], isLoading } = useQuery({ queryKey: ['my-orders'], queryFn: getMyOrders });

  return (
    <section className="container-pad py-10">
      <h1 className="font-display text-4xl font-bold">Order history</h1>
      {isLoading ? <div className="mt-6"><LoadingState /></div> : null}
      <div className="mt-6 grid gap-4">
        {orders.map((order) => (
          <article key={order._id} className="rounded-3xl border border-roseGold/10 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-roseGold">{new Date(order.createdAt).toLocaleDateString()}</p>
                <h2 className="mt-1 font-display text-2xl font-bold">Order #{order._id.slice(-6)}</h2>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-lg font-extrabold">{formatPrice(order.totalAmount)}</p>
                <p className="text-sm font-bold capitalize text-roseGold">{order.orderStatus}</p>
              </div>
            </div>
          </article>
        ))}
        {!isLoading && !orders.length ? <p className="rounded-3xl bg-white p-6 text-ink/60">No orders yet.</p> : null}
      </div>
    </section>
  );
}
