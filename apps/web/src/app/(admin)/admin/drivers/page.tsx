'use client';
import { useEffect, useState } from 'react';
import { Truck, Plus, ToggleLeft, ToggleRight } from 'lucide-react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function AdminDriversPage() {
  const [drivers, setDrivers] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/drivers').then(r => setDrivers(r.data.data || [])).finally(() => setLoading(false));
  }, []);

  async function toggleAvailability(id: string, current: boolean) {
    try {
      await api.put(`/admin/drivers/${id}`, { isAvailable: !current });
      setDrivers(d => d.map(x => x.id === id ? { ...x, isAvailable: !current } : x));
      toast.success('Driver availability updated');
    } catch { toast.error('Failed'); }
  }

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Driver Management</h1>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-brand-700 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>{['Driver', 'Vehicle', 'License', 'Plate', 'Location', 'Available', 'Actions'].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {drivers.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center">
                  <Truck className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">No drivers registered yet</p>
                </td></tr>
              ) : drivers.map(d => (
                <tr key={d.id as string} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="text-xs font-medium text-gray-900">{((d.user as Record<string, unknown>)?.profile as Record<string, string>)?.firstName} {((d.user as Record<string, unknown>)?.profile as Record<string, string>)?.lastName}</p>
                    <p className="text-xs text-gray-400">{((d.user as Record<string, string>)?.email)}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">{d.vehicleType as string}</td>
                  <td className="px-4 py-3 text-xs font-mono text-gray-600">{d.licenseNumber as string}</td>
                  <td className="px-4 py-3 text-xs font-mono text-gray-600">{d.vehiclePlate as string}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {d.currentLat ? `${Number(d.currentLat).toFixed(3)}, ${Number(d.currentLng).toFixed(3)}` : 'Unknown'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn('badge text-xs', d.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')}>
                      {d.isAvailable ? 'Available' : 'Busy'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleAvailability(d.id as string, d.isAvailable as boolean)} className="text-gray-400 hover:text-brand-700">
                      {d.isAvailable ? <ToggleRight className="w-5 h-5 text-green-500" /> : <ToggleLeft className="w-5 h-5" />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
