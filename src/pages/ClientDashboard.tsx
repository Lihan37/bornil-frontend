import { Link } from 'react-router-dom';
import { ClipboardList, LogOut, UserRound } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function ClientDashboard() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  return (
    <section className="container-pad py-10">
      <h1 className="font-display text-4xl font-bold">My dashboard</h1>
      <p className="mt-2 text-ink/60">Welcome back, {user?.name}.</p>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <Link to="/dashboard/profile" className="rounded-3xl border border-roseGold/10 bg-white p-6 shadow-sm transition hover:-translate-y-1">
          <UserRound className="text-roseGold" />
          <h2 className="mt-4 font-display text-2xl font-bold">Profile</h2>
          <p className="mt-1 text-sm text-ink/60">View and edit account information.</p>
        </Link>
        <Link to="/dashboard/orders" className="rounded-3xl border border-roseGold/10 bg-white p-6 shadow-sm transition hover:-translate-y-1">
          <ClipboardList className="text-roseGold" />
          <h2 className="mt-4 font-display text-2xl font-bold">Orders</h2>
          <p className="mt-1 text-sm text-ink/60">Track order history and status.</p>
        </Link>
        <button onClick={logout} className="rounded-3xl border border-roseGold/10 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1" type="button">
          <LogOut className="text-roseGold" />
          <h2 className="mt-4 font-display text-2xl font-bold">Logout</h2>
          <p className="mt-1 text-sm text-ink/60">End this secure session.</p>
        </button>
      </div>
    </section>
  );
}
