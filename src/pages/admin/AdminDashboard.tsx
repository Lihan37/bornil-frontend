import { useQuery } from '@tanstack/react-query';
import { ClipboardList, Package, TrendingUp, Users } from 'lucide-react';
import AdminShell from './AdminShell';
import { getOrders } from '../../services/orderService';
import { getProducts } from '../../services/productService';
import { getAdminUsers } from '../../services/userService';
import { formatPrice } from '../../utils/format';
import type { OrderStatus } from '../../types';

const statusStyles: Record<OrderStatus, string> = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-sky-100 text-sky-700',
  processing: 'bg-indigo-100 text-indigo-700',
  shipped: 'bg-violet-100 text-violet-700',
  delivered: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-600',
};

export default function AdminDashboard() {
  const { data } = useQuery({ queryKey: ['admin-products'], queryFn: () => getProducts({ limit: 48 }) });
  const products = data?.products || [];
  const { data: orders = [] } = useQuery({ queryKey: ['admin-orders'], queryFn: getOrders });
  const { data: users = [] } = useQuery({ queryKey: ['admin-users'], queryFn: getAdminUsers });
  const revenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);

  const stats = [
    { label: 'Products', value: products.length.toString(), icon: Package },
    { label: 'Orders', value: orders.length.toString(), icon: ClipboardList },
    { label: 'Users', value: users.length.toString(), icon: Users },
    { label: 'Revenue', value: formatPrice(revenue), icon: TrendingUp },
  ];

  return (
    <AdminShell title="Dashboard">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="relative overflow-hidden rounded-3xl border border-roseGold/10 bg-white/90 p-6 shadow-[0_18px_40px_-30px_rgba(74,40,48,0.5)] backdrop-blur-sm">
            <div className="absolute -right-4 -top-4 grid h-16 w-16 place-items-center rounded-full bg-blush/60 text-roseGold">
              <Icon size={22} />
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-roseGold">{label}</p>
            <p className="mt-3 text-3xl font-extrabold">{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 rounded-[2rem] border border-roseGold/10 bg-white/90 p-6 shadow-soft backdrop-blur-sm">
        <h2 className="font-display text-2xl font-bold">Recent orders</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.18em] text-ink/45">
              <tr>
                <th className="py-3">Customer</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-roseGold/10">
              {orders.slice(0, 5).map((order) => (
                <tr key={order._id} className="transition hover:bg-blush/25">
                  <td className="py-4 font-bold">{order.customerName}</td>
                  <td>{formatPrice(order.totalAmount)}</td>
                  <td><span className={`badge ${statusStyles[order.orderStatus]}`}>{order.orderStatus}</span></td>
                  <td className="text-ink/60">{new Date(order.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {!orders.length ? (
                <tr><td colSpan={4} className="py-6 text-center text-ink/50">No orders yet.</td></tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}
