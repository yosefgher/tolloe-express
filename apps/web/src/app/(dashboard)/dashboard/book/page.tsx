import BookingForm from '@/components/shipment/BookingForm';

export default function DashboardBookPage() {
  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Book a Shipment</h1>
      <BookingForm />
    </div>
  );
}
