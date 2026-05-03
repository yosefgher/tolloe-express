import type { Metadata } from 'next';
import Link from 'next/link';
import { Package, Clock, Shield, MapPin, Truck, ArrowRight, CheckCircle } from 'lucide-react';
import TrackForm from '@/components/tracking/TrackForm';

async function getCms(): Promise<Record<string, string>> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cms`, { next: { revalidate: 60 } });
    if (!res.ok) return {};
    const json = await res.json();
    return json.data ?? {};
  } catch {
    return {};
  }
}

const SERVICE_ICONS = [Clock, Truck, Package, MapPin];
const SERVICE_COLORS = ['bg-orange-50 text-orange-600', 'bg-blue-50 text-blue-600', 'bg-green-50 text-green-600', 'bg-purple-50 text-purple-600'];

const DEFAULT_STATS = [
  { value: '15+', label: 'Cities Covered' },
  { value: '5,000+', label: 'Monthly Deliveries' },
  { value: '98%', label: 'On-Time Rate' },
  { value: '24/7', label: 'Customer Support' },
];

const DEFAULT_FEATURES = [
  'Real-time package tracking', 'Proof of delivery with photos',
  'Cash on delivery (COD) support', 'Business bulk shipping API',
  'Door-to-door pickup & delivery', 'SMS & email notifications',
];

const DEFAULT_SERVICES = [
  { title: 'Same-Day Delivery',  description: 'Order before noon, delivered the same day within Addis Ababa.', price: 'From 200 ETB' },
  { title: 'Express Delivery',   description: '1–2 business days to major cities across Ethiopia.',             price: 'From 120 ETB' },
  { title: 'Standard Delivery',  description: '3–5 business days, nationwide coverage.',                       price: 'From 80 ETB' },
  { title: 'Economy Delivery',   description: 'Budget-friendly option for non-urgent shipments.',              price: 'From 50 ETB' },
];

export async function generateMetadata(): Promise<Metadata> {
  const cms = await getCms();
  return {
    title: cms['seo.home.title'] ?? "TOLLOE EXPRESS — Ethiopia's Trusted Courier Service",
    description: cms['seo.home.description'] ?? 'Fast, reliable nationwide delivery across Ethiopia. Book online, track in real-time.',
  };
}

export default async function HomePage() {
  const cms = await getCms();

  const stats: { value: string; label: string }[] = (() => {
    try { return JSON.parse(cms['home.stats'] ?? ''); } catch { return DEFAULT_STATS; }
  })();

  const features: string[] = (() => {
    try { return JSON.parse(cms['home.features.list'] ?? ''); } catch { return DEFAULT_FEATURES; }
  })();

  const heroTitle  = cms['home.hero.title']          ?? 'Fast. Reliable. Nationwide Delivery';
  const heroBadge  = cms['home.hero.badge']          ?? "Ethiopia's Trusted Courier";
  const heroSub    = cms['home.hero.subtitle']       ?? 'From Addis Ababa to every corner of Ethiopia — we deliver what matters most. Book online in minutes.';
  const svcHeading = cms['home.services.heading']    ?? 'Our Services';
  const svcSub     = cms['home.services.subheading'] ?? 'Choose the delivery speed that fits your needs';
  const ftHeading  = cms['home.features.heading']    ?? 'Why Choose TOLLOE EXPRESS?';
  const ftBody     = cms['home.features.body']       ?? 'We combine technology with local expertise to provide the most reliable delivery experience in Ethiopia.';
  const ctaTitle   = cms['home.cta.title']           ?? 'Ready to Ship?';
  const ctaSub     = cms['home.cta.subtitle']        ?? 'Join thousands of Ethiopians who trust TOLLOE EXPRESS every day.';

  return (
    <>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-brand-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 bg-brand-700/30 border border-brand-500/30 text-brand-300 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
              <Package className="w-4 h-4" />{heroBadge}
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              {heroTitle.includes('Nationwide')
                ? <>{heroTitle.split('Nationwide')[0]}<span className="text-brand-400">Nationwide</span>{heroTitle.split('Nationwide')[1]}</>
                : heroTitle}
            </h1>
            <p className="text-lg text-gray-300 mb-8 max-w-xl">{heroSub}</p>
            <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/10 max-w-xl">
              <p className="text-sm font-medium text-gray-300 mb-3">Track your shipment</p>
              <TrackForm dark />
            </div>
          </div>
        </div>
        <div className="relative bg-brand-700/20 border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((s) => (
                <div key={s.label} className="text-center">
                  <div className="text-3xl font-bold text-white">{s.value}</div>
                  <div className="text-sm text-gray-300 mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">{svcHeading}</h2>
            <p className="text-gray-500 mt-2">{svcSub}</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {DEFAULT_SERVICES.map((s, i) => {
              const Icon = SERVICE_ICONS[i];
              return (
                <div key={s.title} className="card p-6 hover:shadow-md transition-shadow">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${SERVICE_COLORS[i]}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{s.title}</h3>
                  <p className="text-sm text-gray-500 mb-3">{s.description}</p>
                  <p className="text-brand-700 font-semibold text-sm">{s.price}</p>
                </div>
              );
            })}
          </div>
          <div className="text-center mt-8">
            <Link href="/services" className="btn-outline inline-flex items-center gap-2">
              View All Services <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">{ftHeading}</h2>
              <p className="text-gray-500 mb-8">{ftBody}</p>
              <div className="grid sm:grid-cols-2 gap-3">
                {features.map((f) => (
                  <div key={f} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-brand-700 shrink-0" />
                    <span className="text-sm text-gray-700">{f}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/book" className="btn-primary inline-flex items-center gap-2">
                  Book a Shipment <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/calculate" className="btn-outline">Get a Quote</Link>
              </div>
            </div>
            <div className="bg-gradient-to-br from-brand-50 to-orange-50 rounded-2xl p-8">
              <div className="space-y-4">
                {[
                  { icon: '📦', step: '1. Book Online',         desc: 'Fill out the simple booking form in under 2 minutes.' },
                  { icon: '🚚', step: '2. We Pick Up',          desc: 'Our driver collects your package from your door.' },
                  { icon: '📍', step: '3. Real-Time Tracking',  desc: 'Follow your shipment every step of the way.' },
                  { icon: '✅', step: '4. Delivered!',          desc: 'Proof of delivery sent directly to your phone & email.' },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4 bg-white rounded-xl p-4 shadow-sm">
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{item.step}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-700 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">{ctaTitle}</h2>
          <p className="text-brand-100 mb-8">{ctaSub}</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/register" className="bg-white text-brand-700 font-semibold px-6 py-3 rounded-lg hover:bg-brand-50 transition-colors">
              Create Free Account
            </Link>
            <Link href="/contact" className="border border-white/30 text-white font-semibold px-6 py-3 rounded-lg hover:bg-white/10 transition-colors">
              Contact Sales
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
