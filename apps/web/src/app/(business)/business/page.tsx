'use client';
import { useEffect, useState } from 'react';
import { Package, TrendingUp, Users, Clock } from 'lucide-react';
import Link from 'next/link';
import StatsCard from '@/components/dashboard/StatsCard';
import { api } from '@/lib/api';
import { cn, STATUS_COLORS, STATUS_LABELS, formatDate, formatETB } from '@/lib/utils';

export default function BusinessOverviewPage() {
  const [shipments, setShipments] = useState<Array<Record<string, unknown>>>([]);

  useEffect(() => {
    api.get('/shipments?limit=5').then(r => setShipments(r.data.data?.items || [])).catch(() => {});
  }, []);

  const total = shipments.length;
  const delivered = shipments.filter(s => s.status === 'DELIVERED').length;
  const inTransit = shipments.filter(s => ['IN_TRANSIT', 'PICKED_UP', 'OUT_FOR_DELIVERY'].includes(s.status as string)).length;

  return (
    <div className="p-6 max-w-5xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Business Overview</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard title="Total Shipments" value={total} icon={Package} color="bg-blue-100 text-blue-700" />
        <StatsCard title="In Transit" value={inTransit} icon={TrendingUp} color="bg-purple-100 text-purple-700" />
        <StatsCard title="Delivered" value={delivered} icon={Users} color="bg-green-100 text-green-700" />
        <StatsCard title="Pending" value={total - delivered - inTransit} icon={Clock} color="bg-yellow-100 text-yellow-700" />
      </div>

      <div className="card">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Recent Shipments</h2>
          <Link href="/business/shipments" className="text-sm text-brand-700 hover:underline">View all</Link>
        </div>
        <div className="divide-y divide-gray-50">
          {shipments.map(s => (
            <div key={s.id as string} className="flex items-center justify-between px-6 py-4">
              <div>
                <p className="font-mono text-sm font-medium text-gray-900">{s.trackingNumber as string}</p>
                <p className="text-xs text-gray-500">{formatDate(s.createdAt as string)}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-sm">{formatETB(Number(s.totalPrice))}</span>
                <span className={cn('badge text-xs', STATUS_COLORS[s.status as string])}>{STATUS_LABELS[s.status as string]}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
