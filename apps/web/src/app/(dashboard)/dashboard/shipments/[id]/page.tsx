'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Package, MapPin, Calendar, User, Download } from 'lucide-react';
import { api } from '@/lib/api';
import TrackingTimeline from '@/components/tracking/TrackingTimeline';
import { cn, STATUS_COLORS, STATUS_LABELS, SERVICE_LABELS, formatDate, formatETB } from '@/lib/utils';

export default function ShipmentDetailPage({ params }: { params: { id: string } }) {
  const [shipment, setShipment] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/shipments/${params.id}`).then(r => setShipment(r.data.data)).finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return <div className="p-6 flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-brand-700 border-t-transparent rounded-full animate-spin" /></div>;
  if (!shipment) return <div className="p-6 text-center text-gray-500">Shipment not found</div>;

  const s = shipment as Record<string, unknown>;

  return (
    <div className="p-6 max-w-4xl">
      <Link href="/dashboard/shipments" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to shipments
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <p className="text-sm text-gray-500">Tracking Number</p>
          <p className="font-mono text-xl font-bold text-gray-900">{s.trackingNumber as string}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={cn('badge text-sm px-4 py-1.5', STATUS_COLORS[s.status as string])}>{STATUS_LABELS[s.status as string]}</span>
          <a href={`${process.env.NEXT_PUBLIC_API_URL}/shipments/${params.id}/invoice`} target="_blank" rel="noopener" className="btn-secondary flex items-center gap-2 text-sm">
            <Download className="w-4 h-4" /> Invoice
          </a>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <div className="card p-4"><p className="text-xs text-gray-500 mb-1">Service</p><p className="font-semibold">{SERVICE_LABELS[s.serviceType as string]}</p></div>
        <div className="card p-4"><p className="text-xs text-gray-500 mb-1">Weight</p><p className="font-semibold">{Number(s.weight).toFixed(1)} kg</p></div>
        <div className="card p-4"><p className="text-xs text-gray-500 mb-1">Total Price</p><p className="font-bold text-brand-700">{formatETB(Number(s.totalPrice))}</p></div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><MapPin className="w-4 h-4 text-green-600" />Pickup</h3>
          <p className="text-sm text-gray-700">{(s.pickupAddress as Record<string, string>)?.street}</p>
          <p className="text-sm text-gray-500">{(s.pickupAddress as Record<string, string>)?.city}, {(s.pickupAddress as Record<string, string>)?.region}</p>
        </div>
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><MapPin className="w-4 h-4 text-brand-700" />Delivery</h3>
          <p className="text-sm text-gray-700">{(s.deliveryAddress as Record<string, string>)?.street}</p>
          <p className="text-sm text-gray-500">{(s.deliveryAddress as Record<string, string>)?.city}, {(s.deliveryAddress as Record<string, string>)?.region}</p>
        </div>
      </div>

      <div className="card p-6">
        <TrackingTimeline events={(s.trackingEvents as Array<{ id: string; status: string; location: string | null; notes: string | null; timestamp: string }>) || []} currentStatus={s.status as string} />
      </div>
    </div>
  );
}
