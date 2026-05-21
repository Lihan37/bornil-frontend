import { useQuery } from '@tanstack/react-query';
import AdminShell from './AdminShell';
import { getOrders } from '../../services/orderService';
import { getProducts } from '../../services/productService';
import { getAdminUsers } from '../../services/userService';
import { formatPrice } from '../../utils/format';

export default function AdminDashboard() {
  const { data } = useQuery({ queryKey: ['admin-products'], queryFn: () => getProducts({ limit: 48 }) });
  const products = data?.products || [];
  const { data: orders = [] } = useQuery({ queryKey: ['admin-orders'], queryFn: getOrders });
  const { data: users = [] } = useQuery({ queryKey: ['admin-users'], queryFn: getAdminUsers });
  const revenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);

  return (
    <AdminShell title="Dashboard">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ['Products', products.length.toString()],
          ['Orders', orders.length.toString()],
          ['Users', users.length.toString()],
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
                  <td>{formatPrice(order.totalAmount)}</td>
                  <td className="capitalize">{order.orderStatus}</td>
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
