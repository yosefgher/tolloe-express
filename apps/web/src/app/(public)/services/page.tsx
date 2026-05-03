import type { Metadata } from 'next';
import Link from 'next/link';
import { Clock, Truck, Package, BarChart, Building, Code, ArrowRight } from 'lucide-react';

export const metadata: Metadata = { title: 'Our Services' };

const services = [
  {
    icon: Clock, title: 'Same-Day Delivery', price: 'From 200 ETB', days: 'Same day',
    description: 'Order before noon, delivered within Addis Ababa the same day. Perfect for urgent documents and gifts.',
    features: ['Available within Addis Ababa', 'Order cutoff: 12:00 PM', 'Real-time GPS tracking', 'SMS notifications'],
    color: 'bg-orange-50 border-orange-200',
    badge: 'Fastest',
    badgeColor: 'bg-orange-100 text-orange-700',
  },
  {
    icon: Truck, title: 'Express Delivery', price: 'From 120 ETB', days: '1–2 days',
    description: 'Reach major cities across Ethiopia in 1–2 business days. Ideal for time-sensitive shipments.',
    features: ['All major Ethiopian cities', 'Priority handling', 'Proof of delivery', 'Email + SMS updates'],
    color: 'bg-blue-50 border-blue-200',
    badge: 'Popular',
    badgeColor: 'bg-blue-100 text-blue-700',
  },
  {
    icon: Package, title: 'Standard Delivery', price: 'From 80 ETB', days: '3–5 days',
    description: 'Reliable nationwide delivery at an affordable price. Great for regular e-commerce orders.',
    features: ['Nationwide coverage', 'Package insurance option', 'Tracking updates', 'Proof of delivery'],
    color: 'bg-green-50 border-green-200',
    badge: 'Best Value',
    badgeColor: 'bg-green-100 text-green-700',
  },
  {
    icon: BarChart, title: 'Economy Delivery', price: 'From 50 ETB', days: '5–7 days',
    description: 'Budget-friendly option for non-urgent, lightweight shipments anywhere in Ethiopia.',
    features: ['Best price point', 'Nationwide coverage', 'Basic tracking', 'Suitable for documents'],
    color: 'bg-purple-50 border-purple-200',
    badge: 'Cheapest',
    badgeColor: 'bg-purple-100 text-purple-700',
  },
  {
    icon: Building, title: 'Business Accounts', price: 'Custom pricing',
    description: 'Special rates and monthly invoicing for businesses with regular shipping needs.',
    features: ['Volume discounts', 'Monthly billing', 'Dedicated account manager', 'Bulk CSV upload'],
    color: 'bg-gray-50 border-gray-200', badge: 'For Businesses', badgeColor: 'bg-gray-100 text-gray-700',
  },
  {
    icon: Code, title: 'API Integration', price: 'Contact us',
    description: 'Integrate TOLLOE EXPRESS directly into your e-commerce platform or ERP system.',
    features: ['RESTful API', 'Webhook notifications', 'Shopify/WooCommerce ready', 'Sandbox environment'],
    color: 'bg-indigo-50 border-indigo-200', badge: 'Developers', badgeColor: 'bg-indigo-100 text-indigo-700',
  },
];

export default function ServicesPage() {
  return (
    <div className="py-12 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900">Our Services</h1>
          <p className="text-gray-500 mt-3 max-w-xl mx-auto">Choose the delivery solution that best fits your needs and budget</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {services.map((s) => (
            <div key={s.title} className={`card border p-6 ${s.color}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                  <s.icon className="w-5 h-5 text-gray-700" />
                </div>
                <span className={`badge text-xs ${s.badgeColor}`}>{s.badge}</span>
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-1">{s.title}</h3>
              <p className="font-semibold text-brand-700 text-sm mb-2">{s.price}</p>
              {s.days && <p className="text-xs text-gray-500 mb-3">Delivery: {s.days}</p>}
              <p className="text-sm text-gray-600 mb-4">{s.description}</p>
              <ul className="space-y-1">
                {s.features.map(f => (
                  <li key={f} className="text-xs text-gray-600 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-brand-700 rounded-full shrink-0" />{f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="text-center">
          <Link href="/book" className="btn-primary inline-flex items-center gap-2 text-base px-6 py-3">
            Book a Shipment <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
