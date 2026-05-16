import { Gem, Heart, PackageCheck, ShieldCheck, Sparkles, Truck } from 'lucide-react';

const promises = [
  {
    icon: Sparkles,
    title: 'Artisan Integrity',
    text: 'Every piece is handcrafted with precision and passion.',
  },
  {
    icon: Gem,
    title: 'Exclusivity',
    text: 'A strict one-piece only model. Never replicated, always unique.',
  },
  {
    icon: ShieldCheck,
    title: 'Quality Materials',
    text: 'Sourced and assembled to keep your jewelry timeless.',
  },
];

const policies = [
  {
    icon: Truck,
    title: 'Shipping & Delivery',
    points: ['Inside Dhaka deliveries typically take 2-3 days.', 'Outside Dhaka orders ship nationwide within 4-5 days.'],
  },
  {
    icon: PackageCheck,
    title: 'Return & Exchange Policy',
    points: [
      'Please inspect the product while the delivery person is present.',
      'If damaged or incorrect, return it immediately to the delivery person.',
      'After delivery is completed, returns and exchanges cannot be accepted.',
    ],
  },
  {
    icon: Heart,
    title: 'Jewelry Care Guide',
    points: ['Avoid water, perfumes, and harsh chemicals.', 'Store in a cool, dry place, ideally in the pouch or box.', 'Handle wire and resin work with care.'],
  },
  {
    icon: ShieldCheck,
    title: 'Privacy Policy',
    points: ['We only collect necessary order information such as name, address, and contact details.', 'Your data is never shared with third parties for marketing.'],
  },
];

export default function About() {
  return (
    <section className="overflow-hidden">
      <div className="relative isolate bg-ink py-20 text-white sm:py-24">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_25%_20%,rgba(183,110,121,0.35),transparent_32%),linear-gradient(135deg,rgba(43,37,40,1),rgba(74,40,48,0.94))]" />
        <div className="container-pad text-center">
          <p className="about-reveal text-xs font-bold uppercase tracking-[0.32em] text-champagne">About Us</p>
          <h1 className="about-reveal mx-auto mt-4 max-w-4xl font-display text-4xl font-extrabold leading-tight sm:text-5xl lg:text-7xl">
            Where Art Meets Individuality
          </h1>
          <p className="about-reveal mx-auto mt-6 max-w-3xl text-base leading-8 text-white/78 sm:text-lg">
            At Bornil Vibes, jewelry should be as unique as the person wearing it. Founded in Dhaka, our brand is built on the philosophy of one-of-one craftsmanship.
          </p>
        </div>
      </div>

      <div className="container-pad py-14 sm:py-16">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="about-fade rounded-[2rem] border border-roseGold/10 bg-white p-6 shadow-soft sm:p-8">
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-roseGold">Handmade, never mass produced</p>
            <h2 className="mt-4 font-display text-3xl font-bold sm:text-4xl">The soul of the handmade</h2>
            <p className="mt-5 leading-8 text-ink/68">
              We do not believe in mass production. Each piece in our collection is a labor of love, meticulously handcrafted using a blend of resin, intricate wire-work, and carefully selected beads.
            </p>
            <p className="mt-4 leading-8 text-ink/68">
              When you own a Bornil Vibes piece, you own the only one of its kind in the world.
            </p>
          </div>

          <div className="about-fade rounded-[2rem] bg-blush p-6 sm:p-8">
            <h2 className="font-display text-3xl font-bold">Our inspiration</h2>
            <p className="mt-5 leading-8 text-ink/68">
              Our designs are inspired by the vibrant energy of our heritage and modern elegance. From atmospheric aesthetics to bold statements, we create wearable art that tells a story.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {promises.map((item) => (
                <div key={item.title} className="about-card rounded-3xl border border-white/70 bg-white/80 p-5">
                  <item.icon className="text-roseGold" size={24} />
                  <h3 className="mt-4 font-bold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-ink/62">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-14 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-roseGold">Our Policies</p>
          <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">Clear care from order to everyday wear</h2>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {policies.map((policy) => (
            <article key={policy.title} className="about-card rounded-[1.6rem] border border-roseGold/10 bg-white p-6 shadow-sm">
              <policy.icon className="text-roseGold" size={25} />
              <h3 className="mt-4 font-display text-2xl font-bold">{policy.title}</h3>
              <ul className="mt-4 grid gap-3 text-sm leading-6 text-ink/66">
                {policy.points.map((point) => (
                  <li key={point} className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-roseGold" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
