import { ArrowLeft, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <section className="container-pad grid min-h-[65vh] place-items-center py-12 text-center">
      <div className="animate-fade-scale">
        <p className="font-display text-8xl font-extrabold text-gilded sm:text-9xl">404</p>
        <h1 className="mt-2 font-display text-4xl font-bold">This page slipped away</h1>
        <p className="mx-auto mt-3 max-w-sm text-ink/55">The piece you're looking for may have moved or sold out. Let's get you back to sparkling.</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link to="/" className="btn-primary"><ArrowLeft size={16} /> Back home</Link>
          <Link to="/products" className="btn-secondary"><Search size={16} /> Browse products</Link>
        </div>
      </div>
    </section>
  );
}
