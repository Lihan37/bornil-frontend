import { Menu, ShoppingBag, X } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { selectCartCount, useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { cn } from '../utils/cn';
import logo from '../assets/bornil logo.png';

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Products', href: '/products' },
  { label: 'About Us', href: '/about' },
];

export default function MainLayout() {
  const [open, setOpen] = useState(false);
  const items = useCartStore((state) => state.items);
  const count = selectCartCount(items);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const nav = (
    <>
      {navItems.map((item) => (
        <NavLink key={item.href} to={item.href} className={({ isActive }) => cn('text-sm font-bold transition hover:text-roseGold', isActive && 'text-roseGold')} onClick={() => setOpen(false)}>
          {item.label}
        </NavLink>
      ))}
      {user?.role === 'admin' ? (
        <NavLink to="/admin" className={({ isActive }) => cn('text-sm font-bold transition hover:text-roseGold', isActive && 'text-roseGold')} onClick={() => setOpen(false)}>
          Admin
        </NavLink>
      ) : null}
    </>
  );

  return (
    <div className="min-h-screen bg-pearl">
      <header className="sticky top-0 z-50 border-b border-roseGold/10 bg-pearl/90 backdrop-blur-xl">
        <div className="container-pad flex h-20 items-center justify-between gap-4">
          <Link to="/" className="flex items-center" aria-label="Bornil Vibes home">
            <img src={logo} alt="Bornil Vibes" className="h-16 w-auto object-contain md:h-20" />
          </Link>

          <nav className="hidden items-center gap-8 md:flex">{nav}</nav>

          <div className="hidden items-center gap-3 md:flex">
            <Link to="/cart" className="relative grid h-11 w-11 place-items-center rounded-full bg-white text-ink shadow-sm" aria-label="Cart">
              <ShoppingBag size={19} />
              {count ? <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-roseGold px-1 text-xs font-bold text-white">{count}</span> : null}
            </Link>
            {user ? (
              <button onClick={logout} className="btn-secondary py-2.5" type="button">Logout</button>
            ) : (
              <Link to="/login" className="btn-primary py-2.5">Login</Link>
            )}
          </div>

          <button className="grid h-11 w-11 place-items-center rounded-full bg-white md:hidden" onClick={() => setOpen((value) => !value)} type="button" aria-label="Menu">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        {open ? (
          <div className="border-t border-roseGold/10 bg-white md:hidden">
            <div className="container-pad flex flex-col gap-5 py-5">
              {nav}
              <Link to="/cart" onClick={() => setOpen(false)} className="text-sm font-bold">Cart ({count})</Link>
              {user ? <button onClick={logout} className="text-left text-sm font-bold">Logout</button> : <Link to="/login" onClick={() => setOpen(false)} className="text-sm font-bold">Login</Link>}
            </div>
          </div>
        ) : null}
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="mt-20 border-t border-roseGold/10 bg-white">
        <div className="container-pad grid gap-8 py-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <h3 className="font-display text-2xl font-bold">Bornil Vibes</h3>
            <p className="mt-3 max-w-md text-sm leading-6 text-ink/65">
              Elegant jewelry for everyday glow, celebrations, and bridal moments. Designed with soft gold details and feminine styling.
            </p>
          </div>
          <div>
            <h4 className="font-bold">Shop</h4>
            <div className="mt-3 grid gap-2 text-sm text-ink/65">
              <Link to="/products">All Products</Link>
              <Link to="/cart">Cart</Link>
              <Link to="/checkout">Checkout</Link>
            </div>
          </div>
          <div>
            <h4 className="font-bold">Contact</h4>
            <p className="mt-3 text-sm leading-6 text-ink/65">Dhaka, Bangladesh<br />support@bornilvibes.com</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
