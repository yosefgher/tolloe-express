'use client';
import { useEffect, useState } from 'react';
import { MapPin, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';

interface ServiceArea { id: string; cityName: string; region: string; lat: number; lng: number; isActive: boolean }

export default function ServiceAreasPage() {
  const [areas, setAreas] = useState<ServiceArea[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ cityName: '', region: '', lat: '', lng: '' });

  useEffect(() => {
    api.get('/admin/service-areas').then(r => setAreas(r.data.data || [])).catch(() => {});
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await api.post('/admin/service-areas', { ...form, lat: parseFloat(form.lat), lng: parseFloat(form.lng) });
      setAreas(a => [...a, res.data.data]);
      setShowForm(false);
      setForm({ cityName: '', region: '', lat: '', lng: '' });
      toast.success('Service area added');
    } catch { toast.error('Failed'); }
  }

  async function toggleActive(id: string, current: boolean) {
    try {
      await api.put(`/admin/service-areas/${id}`, { isActive: !current });
      setAreas(a => a.map(x => x.id === id ? { ...x, isActive: !current } : x));
    } catch { toast.error('Failed'); }
  }

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Service Areas</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> Add City
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="card p-5 mb-6 space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            {[['cityName', 'City Name', 'Addis Ababa'], ['region', 'Region', 'Addis Ababa'], ['lat', 'Latitude', '9.0320'], ['lng', 'Longitude', '38.7469']].map(([k, l, p]) => (
              <div key={k}>
                <label className="text-xs text-gray-600 mb-1 block">{l}</label>
                <input value={(form as Record<string, string>)[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} className="input-field" placeholder={p} required />
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary text-sm">Add Area</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary text-sm">Cancel</button>
          </div>
        </form>
      )}

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>{['City', 'Region', 'Coordinates', 'Active', 'Action'].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {areas.map(area => (
              <tr key={area.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-sm text-gray-900 flex items-center gap-2"><MapPin className="w-3 h-3 text-brand-700" />{area.cityName}</td>
                <td className="px-4 py-3 text-xs text-gray-500">{area.region}</td>
                <td className="px-4 py-3 text-xs font-mono text-gray-400">{area.lat.toFixed(3)}, {area.lng.toFixed(3)}</td>
                <td className="px-4 py-3">
                  <button onClick={() => toggleActive(area.id, area.isActive)} className={`badge text-xs ${area.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {area.isActive ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs">{area.isActive ? '✓' : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
