import type { Metadata } from 'next';
import { Shield, Award, Users, Globe } from 'lucide-react';

export const metadata: Metadata = { title: 'About Us' };

const values = [
  { icon: Shield, title: 'Reliability', description: 'Every shipment is handled with care. We deliver on our promises.' },
  { icon: Award, title: 'Excellence', description: 'Continuous improvement in service quality, speed, and customer experience.' },
  { icon: Users, title: 'Community', description: 'Supporting local businesses and connecting Ethiopian communities.' },
  { icon: Globe, title: 'Innovation', description: 'Leveraging technology to make logistics accessible to everyone.' },
];

export default function AboutPage() {
  return (
    <div className="py-16">
      {/* Hero */}
      <div className="bg-gradient-to-br from-brand-700 to-brand-900 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">About TOLLOE EXPRESS</h1>
          <p className="text-brand-100 text-lg max-w-2xl mx-auto">
            We are Ethiopia's fastest-growing courier company, dedicated to connecting people and businesses across the nation.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 space-y-16">
        {/* Story */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Story</h2>
            <p className="text-gray-600 mb-4">
              TOLLOE EXPRESS was founded with a simple mission: to make reliable delivery accessible to every Ethiopian business and individual.
              What started as a small team in Addis Ababa has grown into a nationwide network covering 15+ cities.
            </p>
            <p className="text-gray-600">
              Today, we process thousands of shipments monthly, helping SMEs reach customers across the country, enabling families to send packages to loved ones, and empowering e-commerce growth in Ethiopia.
            </p>
          </div>
          <div className="bg-brand-50 rounded-2xl p-8 text-center">
            <div className="text-5xl font-bold text-brand-700 mb-2">2020</div>
            <p className="text-gray-600">Founded in Addis Ababa</p>
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div><div className="text-3xl font-bold text-gray-900">15+</div><div className="text-sm text-gray-500">Cities</div></div>
              <div><div className="text-3xl font-bold text-gray-900">50+</div><div className="text-sm text-gray-500">Staff</div></div>
              <div><div className="text-3xl font-bold text-gray-900">5K+</div><div className="text-sm text-gray-500">Monthly Deliveries</div></div>
              <div><div className="text-3xl font-bold text-gray-900">98%</div><div className="text-sm text-gray-500">Satisfaction</div></div>
            </div>
          </div>
        </div>

        {/* Values */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Our Values</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v) => (
              <div key={v.title} className="card p-6 text-center">
                <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <v.icon className="w-6 h-6 text-brand-700" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{v.title}</h3>
                <p className="text-sm text-gray-500">{v.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Licensing */}
        <div className="card p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Licensing & Registration</h2>
          <div className="grid sm:grid-cols-2 gap-6 text-sm">
            <div>
              <p className="font-medium text-gray-700 mb-1">Business Registration</p>
              <p className="text-gray-500">Registered under Ethiopian Investment Commission</p>
              <p className="text-gray-400 mt-1">Reg. No: ETH-BUS-2020-04521</p>
            </div>
            <div>
              <p className="font-medium text-gray-700 mb-1">Courier License</p>
              <p className="text-gray-500">Licensed by Ethiopian Transport Authority</p>
              <p className="text-gray-400 mt-1">License No: ETA-CRL-2021-0089</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
