import { Link } from 'react-router-dom';
import { ClipboardList, LogOut, UserRound } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function ClientDashboard() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const cardClass = 'group rounded-3xl border border-roseGold/10 bg-white/90 p-6 text-left shadow-[0_18px_40px_-30px_rgba(74,40,48,0.5)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-roseGold/25 hover:shadow-glow';
  const iconWrap = 'grid h-12 w-12 place-items-center rounded-2xl bg-blush text-roseGold transition group-hover:scale-110';

  return (
    <section className="container-pad py-12">
      <p className="eyebrow mb-2">Account</p>
      <h1 className="font-display text-4xl font-bold">My dashboard</h1>
      <p className="mt-2 text-ink/60">Welcome back, <span className="font-bold text-ink">{user?.name}</span>.</p>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <Link to="/dashboard/profile" className={cardClass}>
          <div className={iconWrap}><UserRound size={22} /></div>
          <h2 className="mt-4 font-display text-2xl font-bold">Profile</h2>
          <p className="mt-1 text-sm text-ink/60">View and edit account information.</p>
        </Link>
        <Link to="/dashboard/orders" className={cardClass}>
          <div className={iconWrap}><ClipboardList size={22} /></div>
          <h2 className="mt-4 font-display text-2xl font-bold">Orders</h2>
          <p className="mt-1 text-sm text-ink/60">Track order history and status.</p>
        </Link>
        <button onClick={logout} className={cardClass} type="button">
          <div className={iconWrap}><LogOut size={22} /></div>
          <h2 className="mt-4 font-display text-2xl font-bold">Logout</h2>
          <p className="mt-1 text-sm text-ink/60">End this secure session.</p>
        </button>
      </div>
    </section>
  );
}
