import type { Metadata } from 'next';
import { Handshake, Building, Code, TrendingUp } from 'lucide-react';
export const metadata: Metadata = { title: 'Partners & Affiliates' };

const partnerTypes = [
  { icon: Building, title: 'Business Partners', desc: 'Integrate our logistics into your operations. Get volume pricing and dedicated support.' },
  { icon: Code, title: 'Technology Partners', desc: 'Build apps on top of our API. Access developer documentation and sandbox environment.' },
  { icon: TrendingUp, title: 'Affiliate Program', desc: 'Earn commission for every new customer you refer. Track your earnings in real time.' },
  { icon: Handshake, title: 'Resellers', desc: 'Resell TOLLOE EXPRESS services under your own brand in your region.' },
];

export default function PartnersPage() {
  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Partners & Affiliates</h1>
          <p className="text-gray-500 max-w-xl mx-auto">Grow your business with TOLLOE EXPRESS. We offer partnership programs for businesses of all sizes.</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 mb-12">
          {partnerTypes.map((p) => (
            <div key={p.title} className="card p-6">
              <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center mb-4">
                <p.icon className="w-5 h-5 text-brand-700" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{p.title}</h3>
              <p className="text-sm text-gray-500">{p.desc}</p>
            </div>
          ))}
        </div>

        <div className="card p-8 text-center bg-brand-50 border-brand-200 border">
          <h2 className="font-bold text-gray-900 text-xl mb-2">Interested in Partnering?</h2>
          <p className="text-gray-600 mb-6">Contact our partnerships team and we'll find the right program for your business.</p>
          <a href="mailto:partners@toloeexpress.com" className="btn-primary inline-block">Get in Touch</a>
        </div>
      </div>
    </div>
  );
}
