'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, Clock, CheckCircle, Truck, PlusCircle, ArrowRight } from 'lucide-react';
import StatsCard from '@/components/dashboard/StatsCard';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { cn, STATUS_COLORS, STATUS_LABELS, formatDate, formatETB } from '@/lib/utils';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [shipments, setShipments] = useState<Array<{ id: string; trackingNumber: string; status: string; createdAt: string; totalPrice: number; deliveryAddress: { city: string } }>>([]);

  useEffect(() => {
    api.get('/shipments?limit=5').then(r => setShipments(r.data.data?.items || [])).catch(() => {});
  }, []);

  const stats = {
    total: shipments.length,
    pending: shipments.filter(s => s.status === 'PENDING').length,
    inTransit: shipments.filter(s => ['IN_TRANSIT', 'PICKED_UP', 'OUT_FOR_DELIVERY'].includes(s.status)).length,
    delivered: shipments.filter(s => s.status === 'DELIVERED').length,
  };

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.profile?.firstName || 'there'}!
          </h1>
          <p className="text-gray-500 text-sm">Here's an overview of your shipments</p>
        </div>
        <Link href="/dashboard/book" className="btn-primary flex items-center gap-2">
          <PlusCircle className="w-4 h-4" /> New Shipment
        </Link>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard title="Total Shipments" value={stats.total} icon={Package} color="bg-blue-100 text-blue-700" />
        <StatsCard title="Pending" value={stats.pending} icon={Clock} color="bg-yellow-100 text-yellow-700" />
        <StatsCard title="In Transit" value={stats.inTransit} icon={Truck} color="bg-purple-100 text-purple-700" />
        <StatsCard title="Delivered" value={stats.delivered} icon={CheckCircle} color="bg-green-100 text-green-700" />
      </div>

      {/* Recent shipments */}
      <div className="card">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Recent Shipments</h2>
          <Link href="/dashboard/shipments" className="text-sm text-brand-700 flex items-center gap-1 hover:underline">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        {shipments.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm mb-4">No shipments yet</p>
            <Link href="/dashboard/book" className="btn-primary">Book Your First Shipment</Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {shipments.map((s) => (
              <Link key={s.id} href={`/dashboard/shipments/${s.id}`} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
                <div>
                  <p className="font-mono text-sm font-medium text-gray-900">{s.trackingNumber}</p>
                  <p className="text-xs text-gray-500">To: {s.deliveryAddress?.city} · {formatDate(s.createdAt)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-sm text-gray-700">{formatETB(Number(s.totalPrice))}</span>
                  <span className={cn('badge text-xs', STATUS_COLORS[s.status])}>{STATUS_LABELS[s.status]}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
