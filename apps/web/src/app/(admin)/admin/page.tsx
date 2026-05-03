'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, Users, TrendingUp, DollarSign, ArrowRight, Truck } from 'lucide-react';
import StatsCard from '@/components/dashboard/StatsCard';
import { api } from '@/lib/api';
import { cn, STATUS_COLORS, STATUS_LABELS, formatDate, formatETB } from '@/lib/utils';

interface DashboardData {
  stats: { totalShipments: number; todayShipments: number; pendingShipments: number; deliveredShipments: number; totalUsers: number; totalRevenue: number };
  recentShipments: Array<Record<string, unknown>>;
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    api.get('/admin/dashboard').then(r => setData(r.data.data)).catch(() => {});
  }, []);

  const stats = data?.stats;

  return (
    <div className="p-6 max-w-6xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatsCard title="Total Shipments" value={stats?.totalShipments ?? '—'} icon={Package} color="bg-blue-100 text-blue-700" sub="All time" />
        <StatsCard title="Today's Shipments" value={stats?.todayShipments ?? '—'} icon={TrendingUp} color="bg-green-100 text-green-700" />
        <StatsCard title="Pending Pickup" value={stats?.pendingShipments ?? '—'} icon={Truck} color="bg-yellow-100 text-yellow-700" />
        <StatsCard title="Delivered" value={stats?.deliveredShipments ?? '—'} icon={Package} color="bg-brand-100 text-brand-700" />
        <StatsCard title="Total Users" value={stats?.totalUsers ?? '—'} icon={Users} color="bg-purple-100 text-purple-700" />
        <StatsCard title="Total Revenue" value={stats ? formatETB(stats.totalRevenue) : '—'} icon={DollarSign} color="bg-orange-100 text-orange-700" sub="Paid payments" />
      </div>

      <div className="card">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Recent Shipments</h2>
          <Link href="/admin/shipments" className="text-sm text-brand-700 flex items-center gap-1 hover:underline">View all <ArrowRight className="w-3 h-3" /></Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>{['Tracking #', 'Customer', 'Route', 'Price', 'Status', 'Date'].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(data?.recentShipments || []).map(s => (
                <tr key={s.id as string} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/admin/shipments/${s.id}`} className="font-mono text-xs text-brand-700 hover:underline">{s.trackingNumber as string}</Link>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">
                    {((s.sender as Record<string, unknown>)?.profile as Record<string, string>)?.firstName} {((s.sender as Record<string, unknown>)?.profile as Record<string, string>)?.lastName}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{((s.pickupAddress as Record<string, string>)?.city)} → {((s.deliveryAddress as Record<string, string>)?.city)}</td>
                  <td className="px-4 py-3 text-xs font-medium">{formatETB(Number(s.totalPrice))}</td>
                  <td className="px-4 py-3"><span className={cn('badge text-xs', STATUS_COLORS[s.status as string])}>{STATUS_LABELS[s.status as string]}</span></td>
                  <td className="px-4 py-3 text-xs text-gray-400">{formatDate(s.createdAt as string)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
