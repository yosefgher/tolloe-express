'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, Search, Filter } from 'lucide-react';
import { api } from '@/lib/api';
import { cn, STATUS_COLORS, STATUS_LABELS, SERVICE_LABELS, formatDate, formatETB } from '@/lib/utils';
import toast from 'react-hot-toast';

const STATUSES = ['', 'PENDING', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'RETURNED'];

export default function AdminShipmentsPage() {
  const [shipments, setShipments] = useState<Array<Record<string, unknown>>>([]);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  function load() {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '20' });
    if (status) params.set('status', status);
    if (search) params.set('search', search);
    api.get(`/shipments?${params}`).then(r => {
      setShipments(r.data.data?.items || []);
      setTotal(r.data.data?.total || 0);
    }).finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, [status, search, page]);

  async function updateStatus(id: string, newStatus: string) {
    try {
      await api.post(`/shipments/${id}/events`, { status: newStatus });
      load();
      toast.success('Status updated');
    } catch { toast.error('Failed'); }
  }

  return (
    <div className="p-6 max-w-7xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">All Shipments</h1>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search..." className="input-field pl-9" />
        </div>
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} className="input-field sm:w-48">
          <option value="">All Statuses</option>
          {STATUSES.filter(Boolean).map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </select>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>{['Tracking #', 'Sender', 'Route', 'Service', 'Price', 'Status', 'Date', 'Actions'].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>
               : shipments.length === 0 ? <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-400">No shipments found</td></tr>
               : shipments.map(s => (
                <tr key={s.id as string} className="hover:bg-gray-50">
                  <td className="px-4 py-3"><Link href={`/admin/shipments/${s.id}`} className="font-mono text-xs text-brand-700 hover:underline">{s.trackingNumber as string}</Link></td>
                  <td className="px-4 py-3 text-xs text-gray-600">{((s.sender as Record<string, unknown>)?.profile as Record<string, string>)?.firstName} {((s.sender as Record<string, unknown>)?.profile as Record<string, string>)?.lastName}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{((s.pickupAddress as Record<string, string>)?.city)} → {((s.deliveryAddress as Record<string, string>)?.city)}</td>
                  <td className="px-4 py-3 text-xs text-gray-600">{SERVICE_LABELS[s.serviceType as string]}</td>
                  <td className="px-4 py-3 text-xs font-medium">{formatETB(Number(s.totalPrice))}</td>
                  <td className="px-4 py-3"><span className={cn('badge text-xs', STATUS_COLORS[s.status as string])}>{STATUS_LABELS[s.status as string]}</span></td>
                  <td className="px-4 py-3 text-xs text-gray-400">{formatDate(s.createdAt as string)}</td>
                  <td className="px-4 py-3">
                    <select onChange={e => e.target.value && updateStatus(s.id as string, e.target.value)} defaultValue="" className="text-xs border border-gray-200 rounded px-2 py-1">
                      <option value="" disabled>Update...</option>
                      {STATUSES.filter(Boolean).map(st => <option key={st} value={st}>{STATUS_LABELS[st]}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {total > 20 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 text-sm">
            <p className="text-gray-500">Showing {(page-1)*20+1}–{Math.min(page*20,total)} of {total}</p>
            <div className="flex gap-2">
              <button disabled={page===1} onClick={()=>setPage(p=>p-1)} className="btn-secondary text-xs py-1 px-3 disabled:opacity-50">Prev</button>
              <button disabled={page*20>=total} onClick={()=>setPage(p=>p+1)} className="btn-secondary text-xs py-1 px-3 disabled:opacity-50">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
