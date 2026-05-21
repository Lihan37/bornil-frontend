import { Link, NavLink } from 'react-router-dom';
import { BarChart3, ClipboardList, FolderTree, PackagePlus, Settings } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';

const adminLinks = [
  { label: 'Dashboard', href: '/admin', icon: BarChart3 },
  { label: 'Add Product', href: '/admin/add-product', icon: PackagePlus },
  { label: 'Manage Products', href: '/admin/products', icon: Settings },
  { label: 'Categories', href: '/admin/categories', icon: FolderTree },
  { label: 'Orders', href: '/admin/orders', icon: ClipboardList },
];

export default function AdminShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="container-pad grid gap-6 py-10 lg:grid-cols-[260px_1fr]">
      <aside className="h-fit rounded-[2rem] border border-roseGold/10 bg-white p-4 shadow-sm">
        <h2 className="px-3 font-display text-2xl font-bold">Admin</h2>
        <nav className="mt-4 grid gap-2">
          {adminLinks.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.href === '/admin'}
              className={({ isActive }) => cn('flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-bold text-ink/70 transition hover:bg-pearl hover:text-ink', isActive && 'bg-ink text-white hover:bg-ink hover:text-white')}
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <Link to="/products" className="btn-secondary mt-5 w-full py-2.5">View shop</Link>
      </aside>
      <div>
        <h1 className="font-display text-4xl font-bold">{title}</h1>
        <div className="mt-6">{children}</div>
      </div>
    </section>
  );
}
