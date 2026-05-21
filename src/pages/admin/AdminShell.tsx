import { Link, NavLink } from 'react-router-dom';
import { BarChart3, ClipboardList, FolderTree, PackagePlus, Settings, UsersRound } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';

const adminLinks = [
  { label: 'Dashboard', href: '/admin', icon: BarChart3 },
  { label: 'Add Product', href: '/admin/add-product', icon: PackagePlus },
  { label: 'Manage Products', href: '/admin/products', icon: Settings },
  { label: 'Categories', href: '/admin/categories', icon: FolderTree },
  { label: 'Orders', href: '/admin/orders', icon: ClipboardList },
  { label: 'Users', href: '/admin/users', icon: UsersRound },
];

export default function AdminShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="container-pad grid gap-5 py-6 sm:py-8 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-6">
      <aside className="h-fit rounded-[2rem] border border-roseGold/10 bg-white p-3 shadow-sm lg:sticky lg:top-24 lg:p-4">
        <h2 className="px-3 font-display text-2xl font-bold">Admin</h2>
        <nav className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:grid lg:overflow-visible lg:pb-0">
          {adminLinks.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.href === '/admin'}
              className={({ isActive }) => cn('flex shrink-0 items-center gap-2 rounded-2xl px-3 py-3 text-sm font-bold text-ink/70 transition hover:bg-pearl hover:text-ink lg:gap-3', isActive && 'bg-ink text-white hover:bg-ink hover:text-white')}
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <Link to="/products" className="btn-secondary mt-5 w-full py-2.5">View shop</Link>
      </aside>
      <div className="min-w-0">
        <h1 className="font-display text-3xl font-bold sm:text-4xl">{title}</h1>
        <div className="mt-6">{children}</div>
      </div>
    </section>
  );
}
