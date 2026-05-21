import { Link, NavLink } from 'react-router-dom';
import { BarChart3, ClipboardList, FolderTree, Home, LogOut, Menu, PackagePlus, Settings, UsersRound, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { cn } from '../../utils/cn';
import { useAuthStore } from '../../store/authStore';

const adminLinks = [
  { label: 'Home', href: '/', icon: Home, end: true },
  { label: 'Dashboard', href: '/admin', icon: BarChart3 },
  { label: 'Add Product', href: '/admin/add-product', icon: PackagePlus },
  { label: 'Manage Products', href: '/admin/products', icon: Settings },
  { label: 'Categories', href: '/admin/categories', icon: FolderTree },
  { label: 'Orders', href: '/admin/orders', icon: ClipboardList },
  { label: 'Users', href: '/admin/users', icon: UsersRound },
];

export default function AdminShell({ title, children }: { title: string; children: ReactNode }) {
  const logout = useAuthStore((state) => state.logout);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <section className="min-h-screen bg-pearl lg:grid lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="sticky top-0 z-[1000] border-b border-roseGold/10 bg-white/95 p-3 shadow-sm backdrop-blur lg:min-h-screen lg:border-b-0 lg:border-r lg:p-5">
        <div className="flex items-center justify-between gap-3 lg:block">
          <Link to="/admin" className="px-2 font-display text-2xl font-bold">Admin</Link>
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={() => setMenuOpen((value) => !value)}
              type="button"
              className="grid h-10 w-10 place-items-center rounded-full bg-pearl text-ink transition hover:text-roseGold"
              aria-label="Admin menu"
            >
              {menuOpen ? <X size={19} /> : <Menu size={19} />}
            </button>
            <button
              onClick={logout}
              type="button"
              className="grid h-10 w-10 place-items-center rounded-full bg-pearl text-ink transition hover:text-roseGold"
              aria-label="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
        <nav className={cn('absolute left-0 right-0 top-full z-[1001] grid gap-2 border-t border-roseGold/10 bg-white p-3 shadow-soft lg:static lg:mt-4 lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none', menuOpen ? 'grid' : 'hidden lg:grid')}>
          {adminLinks.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.end || item.href === '/admin'}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) => cn('flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-bold text-ink/70 transition hover:bg-pearl hover:text-ink', isActive && 'bg-ink text-white hover:bg-ink hover:text-white')}
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-5 hidden gap-2 lg:grid">
          <Link to="/products" className="btn-secondary w-full py-2.5">View shop</Link>
          <button onClick={logout} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-white transition hover:bg-roseGold" type="button">
            <LogOut size={17} />
            Logout
          </button>
        </div>
      </aside>
      <div className="min-w-0 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <h1 className="font-display text-3xl font-bold sm:text-4xl">{title}</h1>
        <div className="mt-6">{children}</div>
      </div>
    </section>
  );
}
