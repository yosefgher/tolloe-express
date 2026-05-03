import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Terms of Service' };

export default function TermsPage() {
  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="card p-8 prose prose-gray max-w-none">
          <h1>Terms of Service</h1>
          <p className="text-gray-500 text-sm">Last updated: May 2026</p>

          <h2>1. Acceptance of Terms</h2>
          <p>By using TOLLOE EXPRESS services, you agree to these Terms of Service. If you do not agree, please do not use our services.</p>

          <h2>2. Service Description</h2>
          <p>TOLLOE EXPRESS provides courier and delivery services within Ethiopia. We offer same-day, express, standard, and economy delivery options.</p>

          <h2>3. Prohibited Items</h2>
          <p>The following items are prohibited: illegal goods, weapons, dangerous chemicals, currency above legal limits, live animals (without special permit), and perishables without proper packaging.</p>

          <h2>4. Liability Limitations</h2>
          <p>TOLLOE EXPRESS liability is limited to the declared value of the shipment, not to exceed 5,000 ETB unless additional insurance is purchased. We are not liable for indirect damages.</p>

          <h2>5. Claims & Complaints</h2>
          <p>Claims for damaged or lost shipments must be filed within 7 days of delivery. Contact us at claims@toloeexpress.com with your tracking number and supporting photos.</p>

          <h2>6. Payment Terms</h2>
          <p>Payment is due at the time of booking (or upon delivery for COD shipments). Business accounts are invoiced monthly with 15-day payment terms.</p>

          <h2>7. Governing Law</h2>
          <p>These terms are governed by the laws of the Federal Democratic Republic of Ethiopia.</p>
        </div>
      </div>
    </div>
  );
}
