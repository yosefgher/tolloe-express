import type { Metadata } from 'next';
import { Phone, Mail, MapPin, Clock, MessageCircle } from 'lucide-react';

export const metadata: Metadata = { title: 'Contact Us' };

export default function ContactPage() {
  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900">Contact Us</h1>
          <p className="text-gray-500 mt-2">We'd love to hear from you. Get in touch with our team.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact info */}
          <div className="space-y-6">
            <div className="card p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Get in Touch</h2>
              <div className="space-y-4">
                {[
                  { icon: Phone, label: 'Phone', value: '+251 911 000 000', href: 'tel:+251911000000' },
                  { icon: Mail, label: 'Email', value: 'info@toloeexpress.com', href: 'mailto:info@toloeexpress.com' },
                  { icon: MessageCircle, label: 'WhatsApp', value: '+251 911 000 000', href: 'https://wa.me/251911000000' },
                  { icon: MapPin, label: 'Address', value: 'Bole Road, Addis Ababa, Ethiopia', href: null },
                  { icon: Clock, label: 'Hours', value: 'Mon–Sat: 8:00 AM – 6:00 PM', href: null },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-brand-100 rounded-lg flex items-center justify-center shrink-0">
                      <item.icon className="w-4 h-4 text-brand-700" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">{item.label}</p>
                      {item.href ? (
                        <a href={item.href} className="text-sm font-medium text-gray-900 hover:text-brand-700">{item.value}</a>
                      ) : (
                        <p className="text-sm font-medium text-gray-900">{item.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Contact form */}
          <div className="card p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Send a Message</h2>
            <form className="space-y-4" action="#" method="post">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input type="text" className="input-field" placeholder="Selam" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input type="text" className="input-field" placeholder="Haile" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" className="input-field" placeholder="selam@example.com" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone (optional)</label>
                <input type="tel" className="input-field" placeholder="+251 9..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <select className="input-field">
                  <option>General Inquiry</option>
                  <option>Shipment Issue</option>
                  <option>Business Account</option>
                  <option>API Integration</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea className="input-field h-28 resize-none" placeholder="How can we help you?" required />
              </div>
              <button type="submit" className="btn-primary w-full">Send Message</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
