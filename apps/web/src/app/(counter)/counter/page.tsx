'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Package, DollarSign, TrendingUp, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { formatETB, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function CounterDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/counter/dashboard').then(r => setData(r.data.data)).catch(() => toast.error('Failed to load')).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-brand-700 border-t-transparent rounded-full animate-spin" /></div>;

  const { session, stats, recentShipments } = data || {};

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Counter Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Today's activity</p>
        </div>
        <Link href="/counter/new-shipment" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Shipment
        </Link>
      </div>

      {/* Session status */}
      {session ? (
        <div className="card p-4 mb-6 flex items-center gap-3 border-l-4 border-green-500 bg-green-50">
          <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-green-800">Shift Open — {session.counter?.branch?.name} · {session.counter?.name}</p>
            <p className="text-xs text-green-600">Opened at {formatDate(session.openedAt)} · Opening balance: {formatETB(session.openingBalance)}</p>
          </div>
          <Link href="/counter/shift" className="ml-auto text-xs text-green-700 underline">Manage</Link>
        </div>
      ) : (
        <div className="card p-4 mb-6 flex items-center gap-3 border-l-4 border-orange-500 bg-orange-50">
          <AlertCircle className="w-5 h-5 text-orange-600 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-orange-800">No Open Shift</p>
            <p className="text-xs text-orange-600">Open a shift before creating shipments</p>
          </div>
          <Link href="/counter/shift" className="ml-auto btn-primary text-xs">Open Shift</Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Today's Shipments", value: stats?.todayShipments ?? 0, icon: Package, color: 'text-blue-600 bg-blue-50' },
          { label: "Today's Revenue", value: formatETB(stats?.todayRevenue ?? 0), icon: DollarSign, color: 'text-green-600 bg-green-50' },
          { label: 'Cash Received', value: formatETB(session?.cashReceived ?? 0), icon: TrendingUp, color: 'text-orange-600 bg-orange-50' },
          { label: 'Shift Duration', value: session ? `${Math.floor((Date.now() - new Date(session.openedAt).getTime()) / 3600000)}h` : '—', icon: Clock, color: 'text-purple-600 bg-purple-50' },
        ].map(stat => (
          <div key={stat.label} className="card p-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Breakdown by payment method */}
      {stats?.byPayment?.length > 0 && (
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="card p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">By Payment Method</h3>
            <div className="space-y-2">
              {stats.byPayment.map((p: any) => (
                <div key={p.method} className="flex justify-between text-sm">
                  <span className="text-gray-600">{p.method}</span>
                  <span className="font-medium">{p._count} · {formatETB(p._sum.amount)}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">By Service Type</h3>
            <div className="space-y-2">
              {stats.byService?.map((s: any) => (
                <div key={s.serviceType} className="flex justify-between text-sm">
                  <span className="text-gray-600">{s.serviceType.replace('_', ' ')}</span>
                  <span className="font-medium">{s._count} shipments</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recent */}
      <div className="card overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 text-sm">Today's Shipments</h3>
          <Link href="/counter/history" className="text-xs text-brand-700 hover:underline">View all</Link>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>{['Tracking #', 'Recipient', 'Destination', 'Service', 'Amount', 'Payment'].map(h => <th key={h} className="text-left px-4 py-2 text-xs text-gray-500 font-semibold uppercase">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {recentShipments?.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400 text-sm">No shipments today</td></tr>}
            {recentShipments?.map((s: any) => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-4 py-2.5 font-mono text-xs text-brand-700">{s.trackingNumber}</td>
                <td className="px-4 py-2.5 text-xs">{s.recipient?.profile?.firstName} {s.recipient?.profile?.lastName}</td>
                <td className="px-4 py-2.5 text-xs text-gray-500">{s.deliveryAddress?.city}</td>
                <td className="px-4 py-2.5 text-xs">{s.serviceType.replace('_', ' ')}</td>
                <td className="px-4 py-2.5 text-xs font-medium">{formatETB(s.totalPrice)}</td>
                <td className="px-4 py-2.5 text-xs text-gray-500">{s.payment?.method || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
