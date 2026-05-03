'use client';
import type { Metadata } from 'next';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const faqs = [
  { q: 'How do I track my shipment?', a: 'Go to the Track page and enter your tracking number (format: TE-YYYYMMDD-XXXXXX). You can also track at /track/[your-number].' },
  { q: 'How is the shipping price calculated?', a: 'Price is based on service type (base rate), package weight (15 ETB/kg), and distance between origin and destination cities (2 ETB/km). You can use our Price Calculator for an instant estimate.' },
  { q: 'What is Cash on Delivery (COD)?', a: 'COD means the recipient pays upon receiving the package. There is a 30 ETB surcharge for COD shipments. The collected amount is transferred to the sender within 3 business days.' },
  { q: 'How do I book a pickup?', a: 'You can book online at /book or log in to your dashboard. Our driver will collect the package from your specified address.' },
  { q: 'What areas do you cover?', a: 'We cover 15+ major Ethiopian cities including Addis Ababa, Dire Dawa, Mekelle, Gondar, Bahir Dar, Hawassa, Jimma, and more. Visit our Coverage page for the full list.' },
  { q: 'Can I send fragile or valuable items?', a: 'Yes, but please mention "fragile" in the notes when booking. We also offer optional insurance for valuable items. Contact us for special handling requests.' },
  { q: 'What are the maximum package dimensions?', a: 'No strict limit for standard shipments. For very large items (over 30kg or over 100cm per side), please contact our business team for a custom quote.' },
  { q: 'How do business accounts work?', a: 'Business accounts get volume discounts, monthly invoicing, bulk CSV upload, and dedicated support. Register as a Business Client and our team will review your application.' },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors">
        <span className="font-medium text-gray-900 text-sm">{q}</span>
        <ChevronDown className={cn('w-5 h-5 text-gray-400 transition-transform shrink-0 ml-3', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="px-5 pb-4 pt-1 border-t border-gray-100">
          <p className="text-sm text-gray-600">{a}</p>
        </div>
      )}
    </div>
  );
}

export default function FAQPage() {
  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900">Frequently Asked Questions</h1>
          <p className="text-gray-500 mt-2">Quick answers to common questions about TOLLOE EXPRESS</p>
        </div>
        <div className="space-y-3">
          {faqs.map((faq) => <FAQItem key={faq.q} q={faq.q} a={faq.a} />)}
        </div>
        <div className="card p-6 mt-8 text-center">
          <p className="text-gray-600 mb-3">Still have questions?</p>
          <a href="/contact" className="btn-primary inline-block">Contact Our Support Team</a>
        </div>
      </div>
    </div>
  );
}
