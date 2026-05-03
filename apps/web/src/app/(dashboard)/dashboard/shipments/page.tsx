'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, Search, Filter } from 'lucide-react';
import { api } from '@/lib/api';
import { cn, STATUS_COLORS, STATUS_LABELS, SERVICE_LABELS, formatDate, formatETB } from '@/lib/utils';

const STATUSES = ['', 'PENDING', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];

export default function ShipmentsPage() {
  const [shipments, setShipments] = useState<Array<{ id: string; trackingNumber: string; status: string; serviceType: string; weight: number; totalPrice: number; createdAt: string; deliveryAddress: { city: string }; pickupAddress: { city: string } }>>([]);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '10' });
    if (status) params.set('status', status);
    if (search) params.set('search', search);
    api.get(`/shipments?${params}`).then(r => {
      setShipments(r.data.data?.items || []);
      setTotal(r.data.data?.total || 0);
    }).finally(() => setLoading(false));
  }, [status, search, page]);

  return (
    <div className="p-6 max-w-5xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Shipments</h1>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search tracking number..." className="input-field pl-9" />
        </div>
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} className="input-field sm:w-48">
          <option value="">All Statuses</option>
          {STATUSES.filter(Boolean).map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Tracking #', 'Route', 'Service', 'Weight', 'Price', 'Status', 'Date'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>
              ) : shipments.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center">
                  <Package className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">No shipments found</p>
                </td></tr>
              ) : shipments.map(s => (
                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/dashboard/shipments/${s.id}`} className="font-mono text-brand-700 hover:underline text-xs">{s.trackingNumber}</Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{s.pickupAddress?.city} → {s.deliveryAddress?.city}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{SERVICE_LABELS[s.serviceType] || s.serviceType}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{Number(s.weight)}kg</td>
                  <td className="px-4 py-3 font-medium text-xs">{formatETB(Number(s.totalPrice))}</td>
                  <td className="px-4 py-3">
                    <span className={cn('badge text-xs', STATUS_COLORS[s.status])}>{STATUS_LABELS[s.status]}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{formatDate(s.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {total > 10 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 text-sm">
            <p className="text-gray-500">Showing {(page - 1) * 10 + 1}–{Math.min(page * 10, total)} of {total}</p>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-secondary text-xs py-1 px-3 disabled:opacity-50">Prev</button>
              <button disabled={page * 10 >= total} onClick={() => setPage(p => p + 1)} className="btn-secondary text-xs py-1 px-3 disabled:opacity-50">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
