'use client';
import { useEffect, useState } from 'react';
import { MapPin, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

export default function AddressesPage() {
  const { user } = useAuthStore();
  const [addresses, setAddresses] = useState<Array<{ id: string; label: string; street: string; city: string; region: string; country: string; isDefault: boolean }>>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ label: 'Home', street: '', city: '', region: '', country: 'Ethiopia' });

  useEffect(() => {
    if (user) api.get(`/users/${user.id}/addresses`).then(r => setAddresses(r.data.data || [])).catch(() => {});
  }, [user]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.post(`/users/${user?.id}/addresses`, form);
      toast.success('Address added');
      setShowForm(false);
      const r = await api.get(`/users/${user?.id}/addresses`);
      setAddresses(r.data.data || []);
    } catch { toast.error('Failed to add address'); }
  }

  async function handleDelete(id: string) {
    try {
      await api.delete(`/users/${user?.id}/addresses/${id}`);
      setAddresses(a => a.filter(x => x.id !== id));
      toast.success('Address deleted');
    } catch { toast.error('Failed to delete'); }
  }

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Saved Addresses</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> Add Address
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="card p-5 mb-6 space-y-3">
          <h3 className="font-semibold text-gray-900">New Address</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <div><label className="text-xs text-gray-600 mb-1 block">Label</label>
              <input value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} className="input-field" placeholder="Home, Office..." /></div>
            <div><label className="text-xs text-gray-600 mb-1 block">Street</label>
              <input value={form.street} onChange={e => setForm(f => ({ ...f, street: e.target.value }))} className="input-field" placeholder="Bole Road 42" required /></div>
            <div><label className="text-xs text-gray-600 mb-1 block">City</label>
              <input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} className="input-field" placeholder="Addis Ababa" required /></div>
            <div><label className="text-xs text-gray-600 mb-1 block">Region</label>
              <input value={form.region} onChange={e => setForm(f => ({ ...f, region: e.target.value }))} className="input-field" placeholder="Addis Ababa" required /></div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary text-sm">Save Address</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary text-sm">Cancel</button>
          </div>
        </form>
      )}

      {addresses.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <MapPin className="w-10 h-10 mx-auto mb-2 text-gray-300" />
          <p>No saved addresses yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map(addr => (
            <div key={addr.id} className="card p-4 flex items-center justify-between">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-brand-700 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900 text-sm">{addr.label} {addr.isDefault && <span className="badge bg-brand-50 text-brand-700 text-xs ml-2">Default</span>}</p>
                  <p className="text-xs text-gray-500">{addr.street}, {addr.city}, {addr.region}</p>
                </div>
              </div>
              <button onClick={() => handleDelete(addr.id)} className="text-gray-400 hover:text-red-500 p-1">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
