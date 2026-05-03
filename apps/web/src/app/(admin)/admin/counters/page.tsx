'use client';
import { useEffect, useState } from 'react';
import { Plus, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';

export default function CountersPage() {
  const [branches, setBranches] = useState<any[]>([]);
  const [counters, setCounters] = useState<any[]>([]);
  const [showBranchForm, setShowBranchForm] = useState(false);
  const [showCounterForm, setShowCounterForm] = useState(false);
  const [branchForm, setBranchForm] = useState({ name: '', address: '', city: '', region: '' });
  const [counterForm, setCounterForm] = useState({ branchId: '', name: '' });

  useEffect(() => {
    api.get('/counter/branches').then(r => setBranches(r.data.data)).catch(() => {});
    api.get('/counter/counters').then(r => setCounters(r.data.data)).catch(() => {});
  }, []);

  async function addBranch(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await api.post('/admin/branches', branchForm);
      setBranches(b => [...b, res.data.data]);
      setShowBranchForm(false);
      setBranchForm({ name: '', address: '', city: '', region: '' });
      toast.success('Branch added');
    } catch { toast.error('Failed'); }
  }

  async function addCounter(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await api.post('/admin/counters', counterForm);
      setCounters(c => [...c, res.data.data]);
      setShowCounterForm(false);
      setCounterForm({ branchId: '', name: '' });
      toast.success('Counter added');
    } catch { toast.error('Failed'); }
  }

  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Branches & Counters</h1>

      {/* Branches */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-800">Branches</h2>
          <button onClick={() => setShowBranchForm(!showBranchForm)} className="btn-primary text-sm flex items-center gap-2"><Plus className="w-4 h-4" /> Add Branch</button>
        </div>
        {showBranchForm && (
          <form onSubmit={addBranch} className="card p-4 mb-3 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {[['name', 'Branch Name', 'Main Branch — Bole'], ['address', 'Address', 'Bole Road, House 12'], ['city', 'City', 'Addis Ababa'], ['region', 'Region', 'Addis Ababa']].map(([k, l, p]) => (
                <div key={k}><label className="text-xs text-gray-600 mb-1 block">{l}</label>
                  <input value={(branchForm as any)[k]} onChange={e => setBranchForm(f => ({ ...f, [k]: e.target.value }))} className="input-field" placeholder={p} required /></div>
              ))}
            </div>
            <div className="flex gap-2"><button type="submit" className="btn-primary text-sm">Add Branch</button><button type="button" onClick={() => setShowBranchForm(false)} className="btn-secondary text-sm">Cancel</button></div>
          </form>
        )}
        <div className="card overflow-hidden">
          <table className="w-full text-sm"><thead className="bg-gray-50 border-b"><tr>{['Branch', 'City', 'Address', 'Counters'].map(h => <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-gray-50">
              {branches.map(b => <tr key={b.id} className="hover:bg-gray-50">
                <td className="px-4 py-2.5 font-medium">{b.name}</td>
                <td className="px-4 py-2.5 text-xs text-gray-500">{b.city}</td>
                <td className="px-4 py-2.5 text-xs text-gray-500">{b.address}</td>
                <td className="px-4 py-2.5 text-xs">{b.counters?.length || 0} counters</td>
              </tr>)}
            </tbody>
          </table>
        </div>
      </div>

      {/* Counters */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-800">Counters</h2>
          <button onClick={() => setShowCounterForm(!showCounterForm)} className="btn-primary text-sm flex items-center gap-2"><Plus className="w-4 h-4" /> Add Counter</button>
        </div>
        {showCounterForm && (
          <form onSubmit={addCounter} className="card p-4 mb-3 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs text-gray-600 mb-1 block">Branch</label>
                <select value={counterForm.branchId} onChange={e => setCounterForm(f => ({ ...f, branchId: e.target.value }))} className="input-field" required>
                  <option value="">Select branch</option>{branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select></div>
              <div><label className="text-xs text-gray-600 mb-1 block">Counter Name</label>
                <input value={counterForm.name} onChange={e => setCounterForm(f => ({ ...f, name: e.target.value }))} className="input-field" placeholder="Counter 1" required /></div>
            </div>
            <div className="flex gap-2"><button type="submit" className="btn-primary text-sm">Add Counter</button><button type="button" onClick={() => setShowCounterForm(false)} className="btn-secondary text-sm">Cancel</button></div>
          </form>
        )}
        <div className="card overflow-hidden">
          <table className="w-full text-sm"><thead className="bg-gray-50 border-b"><tr>{['Counter', 'Branch', 'City', 'Status'].map(h => <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-gray-50">
              {counters.map(c => <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-4 py-2.5 font-medium flex items-center gap-2"><MapPin className="w-3 h-3 text-brand-700" />{c.name}</td>
                <td className="px-4 py-2.5 text-xs text-gray-500">{c.branch?.name}</td>
                <td className="px-4 py-2.5 text-xs text-gray-500">{c.branch?.city}</td>
                <td className="px-4 py-2.5"><span className={`text-xs px-2 py-0.5 rounded-full ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{c.isActive ? 'Active' : 'Inactive'}</span></td>
              </tr>)}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
