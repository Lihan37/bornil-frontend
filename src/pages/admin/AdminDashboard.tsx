import { useQuery } from '@tanstack/react-query';
import AdminShell from './AdminShell';
import { getOrders } from '../../services/orderService';
import { getProducts } from '../../services/productService';
import { formatPrice } from '../../utils/format';

export default function AdminDashboard() {
  const { data: products = [] } = useQuery({ queryKey: ['admin-products'], queryFn: () => getProducts() });
  const { data: orders = [] } = useQuery({ queryKey: ['admin-orders'], queryFn: getOrders });
  const revenue = orders.reduce((sum, order) => sum + order.total, 0);

  return (
    <AdminShell title="Dashboard">
      <div className="grid gap-4 md:grid-cols-3">
        {[
          ['Products', products.length.toString()],
          ['Orders', orders.length.toString()],
          ['Revenue', formatPrice(revenue)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-3xl border border-roseGold/10 bg-white p-6 shadow-sm">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-roseGold">{label}</p>
            <p className="mt-3 text-3xl font-extrabold">{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 rounded-[2rem] border border-roseGold/10 bg-white p-6 shadow-sm">
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
                <tr key={order._id}>
                  <td className="py-4 font-bold">{order.customerName}</td>
                  <td>{formatPrice(order.total)}</td>
                  <td className="capitalize">{order.status}</td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}
