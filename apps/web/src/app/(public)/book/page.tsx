import type { Metadata } from 'next';
import BookingForm from '@/components/shipment/BookingForm';

export const metadata: Metadata = { title: 'Book a Shipment' };

export default function BookPage() {
  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Book a Shipment</h1>
          <p className="text-gray-500 mt-2">Fill in the details and we'll handle the rest</p>
        </div>
        <BookingForm />
      </div>
    </div>
  );
}
