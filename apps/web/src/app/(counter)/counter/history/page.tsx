'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { formatETB, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';
import { Printer } from 'lucide-react';

export default function HistoryPage() {
  const [shipments, setShipments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/counter/shipments/today').then(r => setShipments(r.data.data)).catch(() => toast.error('Failed')).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-brand-700 border-t-transparent rounded-full animate-spin" /></div>;

  const totalRevenue = shipments.reduce((sum, s) => sum + Number(s.totalPrice), 0);

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Today's Shipments</h1>
          <p className="text-sm text-gray-500">{shipments.length} shipments · {formatETB(totalRevenue)} ETB total</p>
        </div>
        <button onClick={() => window.print()} className="btn-secondary flex items-center gap-2 text-sm"><Printer className="w-4 h-4" /> Print</button>
      </div>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>{['Time', 'Tracking #', 'Sender', 'Receiver', 'City', 'Service', 'Weight', 'Amount', 'Payment'].map(h => <th key={h} className="text-left px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {shipments.length === 0 && <tr><td colSpan={9} className="px-4 py-10 text-center text-gray-400">No shipments today</td></tr>}
            {shipments.map(s => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-3 py-2.5 text-xs text-gray-400">{new Date(s.createdAt).toLocaleTimeString('en-ET', { hour: '2-digit', minute: '2-digit' })}</td>
                <td className="px-3 py-2.5 font-mono text-xs text-brand-700">{s.trackingNumber}</td>
                <td className="px-3 py-2.5 text-xs">{s.sender?.profile?.firstName}</td>
                <td className="px-3 py-2.5 text-xs">{s.recipient?.profile?.firstName} {s.recipient?.profile?.lastName}</td>
                <td className="px-3 py-2.5 text-xs text-gray-500">{s.deliveryAddress?.city}</td>
                <td className="px-3 py-2.5 text-xs">{s.serviceType.replace('_', ' ')}</td>
                <td className="px-3 py-2.5 text-xs">{Number(s.weight)}kg</td>
                <td className="px-3 py-2.5 text-xs font-semibold">{formatETB(s.totalPrice)}</td>
                <td className="px-3 py-2.5 text-xs text-gray-500">{s.payment?.method}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
