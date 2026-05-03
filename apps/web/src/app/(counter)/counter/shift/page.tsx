'use client';
import { useEffect, useState } from 'react';
import { Clock, DollarSign, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { formatETB, formatDate } from '@/lib/utils';

export default function ShiftPage() {
  const [session, setSession] = useState<any>(null);
  const [counters, setCounters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ counterId: '', openingBalance: '' });
  const [closeForm, setCloseForm] = useState({ closingBalance: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/counter/sessions/current'),
      api.get('/counter/counters'),
    ]).then(([s, c]) => {
      setSession(s.data.data);
      setCounters(c.data.data);
      if (c.data.data.length > 0) setForm(f => ({ ...f, counterId: c.data.data[0].id }));
    }).catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  async function openShift() {
    if (!form.counterId || !form.openingBalance) { toast.error('Fill all fields'); return; }
    setSubmitting(true);
    try {
      const res = await api.post('/counter/sessions/open', { counterId: form.counterId, openingBalance: parseFloat(form.openingBalance) });
      setSession(res.data.data);
      toast.success('Shift opened!');
    } catch (e: any) { toast.error(e.response?.data?.error || 'Failed'); }
    finally { setSubmitting(false); }
  }

  async function closeShift() {
    if (!closeForm.closingBalance) { toast.error('Enter closing cash balance'); return; }
    setSubmitting(true);
    try {
      await api.post(`/counter/sessions/${session.id}/close`, { closingBalance: parseFloat(closeForm.closingBalance), notes: closeForm.notes });
      setSession(null);
      toast.success('Shift closed!');
    } catch (e: any) { toast.error(e.response?.data?.error || 'Failed'); }
    finally { setSubmitting(false); }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-brand-700 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="p-6 max-w-xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Shift & Cash Management</h1>

      {session ? (
        <div className="space-y-4">
          <div className="card p-5 border-l-4 border-green-500 bg-green-50">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="font-semibold text-green-800">Shift Open</p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-xs text-green-600">Counter</p><p className="font-medium text-green-900">{session.counter?.branch?.name} — {session.counter?.name}</p></div>
              <div><p className="text-xs text-green-600">Opened At</p><p className="font-medium text-green-900">{formatDate(session.openedAt)}</p></div>
              <div><p className="text-xs text-green-600">Opening Balance</p><p className="font-medium text-green-900">{formatETB(session.openingBalance)} ETB</p></div>
              <div><p className="text-xs text-green-600">Cash Received</p><p className="font-medium text-green-900">{formatETB(session.cashReceived)} ETB</p></div>
              <div><p className="text-xs text-green-600">Expected Closing</p><p className="font-bold text-green-900">{formatETB(Number(session.openingBalance) + Number(session.cashReceived))} ETB</p></div>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><XCircle className="w-4 h-4 text-red-500" /> Close Shift</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Actual Closing Cash Balance (ETB) *</label>
                <input className="input-field" type="number" value={closeForm.closingBalance} onChange={e => setCloseForm(f => ({ ...f, closingBalance: e.target.value }))} placeholder="0.00" />
                {closeForm.closingBalance && (
                  <p className={`text-xs mt-1 ${parseFloat(closeForm.closingBalance) - (Number(session.openingBalance) + Number(session.cashReceived)) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    Variance: {formatETB(parseFloat(closeForm.closingBalance) - (Number(session.openingBalance) + Number(session.cashReceived)))} ETB
                  </p>
                )}
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Notes (optional)</label>
                <textarea className="input-field h-16 resize-none" value={closeForm.notes} onChange={e => setCloseForm(f => ({ ...f, notes: e.target.value }))} placeholder="Any notes about the shift..." />
              </div>
              <button onClick={closeShift} disabled={submitting} className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg text-sm transition-colors disabled:opacity-50">
                {submitting ? 'Closing...' : 'Close Shift & Submit'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-5">
            <AlertCircle className="w-5 h-5 text-orange-500" />
            <h3 className="font-semibold text-gray-900">No Active Shift — Open a New Shift</h3>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Counter *</label>
              <select className="input-field" value={form.counterId} onChange={e => setForm(f => ({ ...f, counterId: e.target.value }))}>
                {counters.map(c => <option key={c.id} value={c.id}>{c.branch?.name} — {c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Opening Cash Balance (ETB) *</label>
              <input className="input-field" type="number" value={form.openingBalance} onChange={e => setForm(f => ({ ...f, openingBalance: e.target.value }))} placeholder="500.00" />
            </div>
            <button onClick={openShift} disabled={submitting} className="w-full btn-primary py-2.5">
              {submitting ? 'Opening...' : 'Open Shift'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
