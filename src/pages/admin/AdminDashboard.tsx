import { useQuery } from '@tanstack/react-query';
import { CalendarDays, ClipboardList, Package, ShoppingBag, TrendingUp, Users } from 'lucide-react';
import { useMemo, useState } from 'react';
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
  delivered: 'bg-teal-100 text-teal-700',
  paid: 'bg-emerald-500 text-white',
  cancelled: 'bg-red-100 text-red-600',
};

export default function AdminDashboard() {
  const { data } = useQuery({ queryKey: ['admin-products'], queryFn: () => getProducts({ limit: 200 }) });
  const productTotal = data?.meta.total ?? data?.products.length ?? 0;
  const { data: orders = [] } = useQuery({ queryKey: ['admin-orders'], queryFn: getOrders });
  const { data: users = [] } = useQuery({ queryKey: ['admin-users'], queryFn: getAdminUsers });
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const filteredOrders = useMemo(() => orders.filter((order) => {
    const date = new Date(order.createdAt);
    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    return (!fromDate || localDate >= fromDate) && (!toDate || localDate <= toDate);
  }), [fromDate, orders, toDate]);
  const validSales = filteredOrders.filter((order) => order.orderStatus !== 'cancelled');
  const paidOrders = filteredOrders.filter((order) => order.orderStatus === 'paid');
  const revenue = paidOrders.reduce((sum, order) => sum + order.totalAmount, 0);
  const itemsSold = validSales.reduce((sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);

  const stats = [
    { label: 'Products', value: productTotal.toString(), icon: Package },
    { label: 'Sales', value: validSales.length.toString(), icon: ShoppingBag },
    { label: 'Items sold', value: itemsSold.toString(), icon: ClipboardList },
    { label: 'Users', value: users.length.toString(), icon: Users },
    { label: 'Revenue (paid)', value: formatPrice(revenue), icon: TrendingUp },
  ];

  return (
    <AdminShell title="Dashboard">
      <div className="mb-5 rounded-3xl border border-roseGold/10 bg-white/90 p-4 shadow-[0_18px_40px_-32px_rgba(74,40,48,0.45)]">
        <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <label>
            <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-ink/45"><CalendarDays size={15} /> From</span>
            <input className="field" type="date" max={toDate || undefined} value={fromDate} onChange={(event) => setFromDate(event.target.value)} />
          </label>
          <label>
            <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-ink/45"><CalendarDays size={15} /> To</span>
            <input className="field" type="date" min={fromDate || undefined} value={toDate} onChange={(event) => setToDate(event.target.value)} />
          </label>
          <button className="btn-secondary py-3" type="button" onClick={() => { setFromDate(''); setToDate(''); }}>Clear</button>
        </div>
        <p className="mt-3 text-sm text-ink/55">{fromDate || toDate ? `Report from ${fromDate || 'start'} to ${toDate || 'today'}` : 'All-time report'}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
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
      <div className="mt-6 rounded-4xl border border-roseGold/10 bg-white/90 p-6 shadow-soft backdrop-blur-sm">
        <h2 className="font-display text-2xl font-bold">Recent orders</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-160 text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.18em] text-ink/45">
              <tr>
                <th className="py-3">Customer</th>
                <th>Products</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-roseGold/10">
              {filteredOrders.slice(0, 5).map((order) => (
                <tr key={order._id} className="transition hover:bg-blush/25">
                  <td className="py-4 font-bold">{order.customerName}</td>
                  <td className="max-w-72 text-ink/65">{order.items.map((item) => `${item.name} x ${item.quantity}`).join(', ')}</td>
                  <td>{formatPrice(order.totalAmount)}</td>
                  <td><span className={`badge ${statusStyles[order.orderStatus]}`}>{order.orderStatus}</span></td>
                  <td className="text-ink/60">{new Date(order.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {!filteredOrders.length ? (
                <tr><td colSpan={5} className="py-6 text-center text-ink/50">No orders yet.</td></tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}
