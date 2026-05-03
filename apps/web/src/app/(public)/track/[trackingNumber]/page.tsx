import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Package, MapPin, Calendar } from 'lucide-react';
import TrackingTimeline from '@/components/tracking/TrackingTimeline';
import { formatDate, formatETB, STATUS_LABELS, STATUS_COLORS, SERVICE_LABELS } from '@/lib/utils';
import { cn } from '@/lib/utils';

export async function generateMetadata({ params }: { params: { trackingNumber: string } }): Promise<Metadata> {
  return { title: `Tracking ${params.trackingNumber}` };
}

async function getShipment(trackingNumber: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
    const res = await fetch(`${apiUrl}/track/${trackingNumber}`, { next: { revalidate: 30 } });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch {
    return null;
  }
}

export default async function TrackingPage({ params }: { params: { trackingNumber: string } }) {
  const shipment = await getShipment(params.trackingNumber);

  if (!shipment) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-gray-50">
        <div className="text-center px-4">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Shipment Not Found</h1>
          <p className="text-gray-500 mb-6">
            No shipment found with tracking number <strong>{params.trackingNumber}</strong>.
          </p>
          <Link href="/track" className="btn-primary">Try Another Number</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <Link href="/track" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to tracking
        </Link>

        {/* Status banner */}
        <div className="card p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Tracking Number</p>
              <p className="font-mono text-lg font-bold text-gray-900">{shipment.trackingNumber}</p>
            </div>
            <span className={cn('badge text-sm px-4 py-1.5', STATUS_COLORS[shipment.status])}>
              {STATUS_LABELS[shipment.status] || shipment.status}
            </span>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">From</p>
                <p className="text-sm font-medium">{shipment.pickupAddress?.city}, {shipment.pickupAddress?.region}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-brand-600 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">To</p>
                <p className="text-sm font-medium">{shipment.deliveryAddress?.city}, {shipment.deliveryAddress?.region}</p>
              </div>
            </div>
            {shipment.estimatedDelivery && (
              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Est. Delivery</p>
                  <p className="text-sm font-medium">{formatDate(shipment.estimatedDelivery)}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Service info */}
        <div className="grid sm:grid-cols-3 gap-4 mb-6">
          <div className="card p-4 text-center">
            <p className="text-xs text-gray-500 mb-1">Service</p>
            <p className="font-semibold text-gray-900">{SERVICE_LABELS[shipment.serviceType] || shipment.serviceType}</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-xs text-gray-500 mb-1">Weight</p>
            <p className="font-semibold text-gray-900">{Number(shipment.weight).toFixed(1)} kg</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-xs text-gray-500 mb-1">Price</p>
            <p className="font-semibold text-brand-700">{formatETB(Number(shipment.totalPrice))}</p>
          </div>
        </div>

        {/* Timeline */}
        <div className="card p-6">
          <TrackingTimeline events={shipment.trackingEvents} currentStatus={shipment.status} />
        </div>
      </div>
    </div>
  );
}
