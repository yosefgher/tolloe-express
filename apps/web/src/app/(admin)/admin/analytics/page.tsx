'use client';
import { useEffect, useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { api } from '@/lib/api';
import { formatETB } from '@/lib/utils';

export default function AnalyticsPage() {
  const [data, setData] = useState<Array<{ date: string; shipments: number; revenue: number }>>([]);
  const [days, setDays] = useState(30);

  useEffect(() => {
    api.get(`/admin/reports?days=${days}`).then(r => setData(r.data.data || [])).catch(() => {});
  }, [days]);

  const totalShipments = data.reduce((s, d) => s + d.shipments, 0);
  const totalRevenue = data.reduce((s, d) => s + d.revenue, 0);
  const avgDaily = totalShipments / (data.length || 1);

  return (
    <div className="p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Analytics & Reports</h1>
        <select value={days} onChange={e => setDays(Number(e.target.value))} className="input-field w-40">
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <div className="card p-5 text-center"><p className="text-3xl font-bold text-gray-900">{totalShipments}</p><p className="text-sm text-gray-500 mt-1">Total Shipments</p></div>
        <div className="card p-5 text-center"><p className="text-3xl font-bold text-brand-700">{formatETB(totalRevenue)}</p><p className="text-sm text-gray-500 mt-1">Total Revenue</p></div>
        <div className="card p-5 text-center"><p className="text-3xl font-bold text-gray-900">{avgDaily.toFixed(1)}</p><p className="text-sm text-gray-500 mt-1">Avg. Daily Shipments</p></div>
      </div>

      {/* Shipments chart */}
      <div className="card p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">Daily Shipments</h2>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6b7280' }} tickFormatter={v => v.slice(5)} />
            <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} allowDecimals={false} />
            <Tooltip formatter={(v: number) => [v, 'Shipments']} labelFormatter={l => `Date: ${l}`} />
            <Bar dataKey="shipments" fill="#E85D04" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Revenue chart */}
      <div className="card p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Daily Revenue (ETB)</h2>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6b7280' }} tickFormatter={v => v.slice(5)} />
            <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
            <Tooltip formatter={(v: number) => [formatETB(v), 'Revenue']} labelFormatter={l => `Date: ${l}`} />
            <Line type="monotone" dataKey="revenue" stroke="#E85D04" strokeWidth={2} dot={false} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
