import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <section className="container-pad grid min-h-[60vh] place-items-center py-10 text-center">
      <div>
        <p className="font-display text-8xl font-bold text-roseGold">404</p>
        <h1 className="mt-3 font-display text-4xl font-bold">Page not found</h1>
        <Link to="/" className="btn-primary mt-6">Back home</Link>
      </div>
    </section>
  );
}
