import { Instagram, Facebook, Mail, Menu, ShoppingBag, Sparkles, User as UserIcon, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { selectCartCount, useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { cn } from '../utils/cn';
import logo from '../assets/bornil logo.png';

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Products', href: '/products' },
  { label: 'About Us', href: '/about' },
];

const announcements = [
  'Handmade, one-of-one jewelry',
  'Free delivery inside Dhaka',
  'Cash on delivery available',
  'Nationwide shipping in 4–5 days',
];

export default function MainLayout() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const items = useCartStore((state) => state.items);
  const count = selectCartCount(items);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const isAdminArea = location.pathname.startsWith('/admin');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const navLink = (href: string, label: string) => (
    <NavLink
      key={href}
      to={href}
      className={({ isActive }) =>
        cn(
          'group relative text-sm font-bold transition-colors hover:text-roseGold',
          isActive ? 'text-roseGold' : 'text-ink/80',
        )
      }
    >
      {({ isActive }) => (
        <>
          {label}
          <span
            className={cn(
              'absolute -bottom-1.5 left-0 h-0.5 rounded-full bg-linear-to-r from-roseGold to-goldLight transition-all duration-300',
              isActive ? 'w-full' : 'w-0 group-hover:w-full',
            )}
          />
        </>
      )}
    </NavLink>
  );

  const nav = (
    <>
      {navItems.map((item) => navLink(item.href, item.label))}
      {user?.role === 'admin' ? navLink('/admin', 'Admin') : null}
      {user && user.role !== 'admin' ? navLink('/dashboard', 'Dashboard') : null}
    </>
  );

  return (
    <div className="flex min-h-screen flex-col">
      {!isAdminArea ? (
        <>
          {/* Announcement marquee */}
          <div className="overflow-hidden bg-ink text-white">
            <div className="flex w-max animate-marquee gap-12 whitespace-nowrap py-2 text-[0.7rem] font-semibold uppercase tracking-[0.22em]">
              {[...announcements, ...announcements, ...announcements, ...announcements].map((text, index) => (
                <span key={index} className="flex items-center gap-3 text-champagne/90">
                  <Sparkles size={12} className="text-goldLight" /> {text}
                </span>
              ))}
            </div>
          </div>

          <header
            className={cn(
              'sticky top-0 z-[1000] border-b transition-all duration-300',
              scrolled
                ? 'border-roseGold/12 bg-pearl/85 shadow-[0_10px_30px_-24px_rgba(74,40,48,0.5)] backdrop-blur-xl'
                : 'border-transparent bg-pearl/70 backdrop-blur-md',
            )}
          >
            <div className={cn('container-pad flex items-center justify-between gap-4 transition-all duration-300', scrolled ? 'h-16' : 'h-20')}>
              <Link to="/" className="flex items-center" aria-label="Bornil Vibes home">
                <img src={logo} alt="Bornil Vibes" className={cn('w-auto object-contain transition-all duration-300', scrolled ? 'h-12 md:h-14' : 'h-14 md:h-16')} />
              </Link>

              <nav className="hidden items-center gap-9 md:flex">{nav}</nav>

              <div className="hidden items-center gap-2.5 md:flex">
                {user ? (
                  <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} className="grid h-11 w-11 place-items-center rounded-full bg-white text-ink shadow-sm transition hover:text-roseGold" aria-label="Account">
                    <UserIcon size={18} />
                  </Link>
                ) : null}
                <Link to="/cart" className="relative grid h-11 w-11 place-items-center rounded-full bg-white text-ink shadow-sm transition hover:text-roseGold" aria-label="Cart">
                  <ShoppingBag size={18} />
                  {count ? <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-roseGold px-1 text-xs font-bold text-white shadow">{count}</span> : null}
                </Link>
                {user ? (
                  <button onClick={logout} className="btn-secondary py-2.5" type="button">Logout</button>
                ) : (
                  <Link to="/login" className="btn-primary py-2.5">Login</Link>
                )}
              </div>

              <div className="flex items-center gap-2 md:hidden">
                <Link to="/cart" className="relative grid h-11 w-11 place-items-center rounded-full bg-white text-ink shadow-sm" aria-label="Cart">
                  <ShoppingBag size={18} />
                  {count ? <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-roseGold px-1 text-xs font-bold text-white">{count}</span> : null}
                </Link>
                <button className="relative z-[1002] grid h-11 w-11 place-items-center rounded-full bg-white shadow-sm" onClick={() => setOpen((value) => !value)} type="button" aria-label="Menu">
                  {open ? <X size={20} /> : <Menu size={20} />}
                </button>
              </div>
            </div>

            {open ? (
              <div className="absolute left-0 right-0 top-full z-[1001] border-t border-roseGold/10 bg-pearl/98 shadow-soft backdrop-blur-xl md:hidden">
                <div className="container-pad flex flex-col gap-5 py-6">
                  {nav}
                  <div className="hairline" />
                  {user ? (
                    <button onClick={logout} className="btn-secondary" type="button">Logout</button>
                  ) : (
                    <Link to="/login" className="btn-primary">Login</Link>
                  )}
                </div>
              </div>
            ) : null}
          </header>
        </>
      ) : null}

      <main className="flex-1">
        <Outlet />
      </main>

      {!isAdminArea ? (
        <footer className="mt-24 border-t border-roseGold/10 bg-linear-to-b from-white to-blush/40">
          <div className="container-pad py-14">
            <div className="grid gap-10 md:grid-cols-[1.6fr_1fr_1fr_1.2fr]">
              <div>
                <h3 className="font-display text-2xl font-bold">Bornil Vibes</h3>
                <p className="mt-4 max-w-sm text-sm leading-7 text-ink/60">
                  Handcrafted, one-of-one jewelry from Dhaka — soft gold details and feminine styling for everyday glow, celebrations, and bridal moments.
                </p>
                <div className="mt-5 flex gap-2.5">
                  {[
                    { icon: Instagram, label: 'Instagram' },
                    { icon: Facebook, label: 'Facebook' },
                    { icon: Mail, label: 'Email' },
                  ].map(({ icon: Icon, label }) => (
                    <a key={label} href="#" aria-label={label} className="grid h-10 w-10 place-items-center rounded-full border border-roseGold/15 bg-white text-ink/70 transition hover:-translate-y-0.5 hover:border-roseGold hover:text-roseGold">
                      <Icon size={17} />
                    </a>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold uppercase tracking-[0.16em] text-ink/50">Shop</h4>
                <div className="mt-4 grid gap-2.5 text-sm text-ink/65">
                  <Link to="/products" className="w-fit transition hover:text-roseGold">All Products</Link>
                  <Link to="/products?category=Bridal%20Jewelry" className="w-fit transition hover:text-roseGold">Bridal</Link>
                  <Link to="/cart" className="w-fit transition hover:text-roseGold">Cart</Link>
                  <Link to="/checkout" className="w-fit transition hover:text-roseGold">Checkout</Link>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold uppercase tracking-[0.16em] text-ink/50">Company</h4>
                <div className="mt-4 grid gap-2.5 text-sm text-ink/65">
                  <Link to="/about" className="w-fit transition hover:text-roseGold">About Us</Link>
                  <Link to="/about" className="w-fit transition hover:text-roseGold">Shipping</Link>
                  <Link to="/about" className="w-fit transition hover:text-roseGold">Returns</Link>
                  <Link to="/about" className="w-fit transition hover:text-roseGold">Care Guide</Link>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold uppercase tracking-[0.16em] text-ink/50">Stay in the loop</h4>
                <p className="mt-4 text-sm leading-6 text-ink/60">New drops and one-of-one pieces, straight to your inbox.</p>
                <form onSubmit={(e) => e.preventDefault()} className="mt-4 flex gap-2">
                  <input type="email" required placeholder="Email address" className="field flex-1" />
                  <button type="submit" className="btn-gold px-4" aria-label="Subscribe">
                    <Mail size={16} />
                  </button>
                </form>
              </div>
            </div>

            <div className="mt-12 hairline" />
            <div className="mt-6 flex flex-col items-center justify-between gap-3 text-xs text-ink/50 sm:flex-row">
              <p>© {new Date().getFullYear()} Bornil Vibes. Handmade in Dhaka, Bangladesh.</p>
              <p>support@bornilvibes.com</p>
            </div>
          </div>
        </footer>
      ) : null}
    </div>
  );
}
