import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Privacy Policy' };

export default function PrivacyPage() {
  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="card p-8 prose prose-gray max-w-none">
          <h1>Privacy Policy</h1>
          <p className="text-gray-500 text-sm">Last updated: May 2026</p>

          <h2>1. Information We Collect</h2>
          <p>We collect information you provide directly to us when you register, book a shipment, or contact us. This includes name, email address, phone number, and physical addresses.</p>

          <h2>2. How We Use Your Information</h2>
          <p>We use the information we collect to: process and fulfill shipments, send tracking notifications, provide customer support, improve our services, and comply with legal obligations.</p>

          <h2>3. Information Sharing</h2>
          <p>We do not sell or share your personal information with third parties except as necessary to fulfill deliveries (sharing with partner carriers and drivers) or as required by Ethiopian law.</p>

          <h2>4. Data Security</h2>
          <p>We implement industry-standard security measures including encrypted data transmission (HTTPS), hashed passwords, and access controls to protect your personal information.</p>

          <h2>5. Data Retention</h2>
          <p>We retain your personal data for as long as your account is active or as needed to provide services, comply with legal obligations, resolve disputes, and enforce agreements.</p>

          <h2>6. Your Rights</h2>
          <p>You have the right to access, correct, or delete your personal information. Contact us at privacy@toloeexpress.com to exercise these rights.</p>

          <h2>7. Contact Us</h2>
          <p>For privacy-related questions, contact us at: privacy@toloeexpress.com</p>
        </div>
      </div>
    </div>
  );
}
