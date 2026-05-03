'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { formatETB } from '@/lib/utils';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import toast from 'react-hot-toast';
import { Download } from 'lucide-react';

export default function ReportsPage() {
  const [dailyData, setDailyData] = useState<any>(null);
  const [rangeData, setRangeData] = useState<any[]>([]);
  const [staffData, setStaffData] = useState<any[]>([]);
  const [dateInput, setDateInput] = useState(new Date().toISOString().split('T')[0]);
  const [period, setPeriod] = useState('week');
  const [loading, setLoading] = useState(true);

  async function loadAll(date: string, p: string) {
    setLoading(true);
    try {
      const [daily, range, staff] = await Promise.all([
        api.get(`/reports/daily?date=${date}`),
        api.get(`/reports/range?period=${p}`),
        api.get('/reports/staff?days=30'),
      ]);
      setDailyData(daily.data.data);
      setRangeData(range.data.data);
      setStaffData(staff.data.data);
    } catch { toast.error('Failed to load reports'); }
    finally { setLoading(false); }
  }

  useEffect(() => { loadAll(dateInput, period); }, []);

  function exportCSV() {
    if (!rangeData.length) return;
    const rows = [['Date', 'Shipments', 'Revenue (ETB)'], ...rangeData.map(r => [r.date, r.shipments, r.revenue])];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `report-${period}.csv`; a.click();
  }

  return (
    <div className="p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
        <button onClick={exportCSV} className="btn-secondary flex items-center gap-2 text-sm"><Download className="w-4 h-4" /> Export CSV</button>
      </div>

      {/* Daily report controls */}
      <div className="card p-4 mb-6">
        <h2 className="font-semibold text-gray-900 mb-3">Daily Sales Report</h2>
        <div className="flex items-center gap-3 mb-4">
          <input type="date" value={dateInput} onChange={e => setDateInput(e.target.value)} className="input-field w-40 text-sm" />
          <button onClick={() => loadAll(dateInput, period)} className="btn-primary text-sm">Load</button>
        </div>
        {dailyData && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Shipments', value: dailyData.totalShipments },
              { label: 'Total Revenue', value: `${formatETB(dailyData.totalRevenue)} ETB` },
              { label: 'By Counter', value: dailyData.byCounter?.map((c: any) => `${c.name}: ${c.count}`).join(', ') || '—' },
              { label: 'Staff Count', value: dailyData.byStaff?.length || 0 },
            ].map(stat => (
              <div key={stat.label} className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
                <p className="font-semibold text-gray-900 text-sm">{stat.value}</p>
              </div>
            ))}
          </div>
        )}
        {dailyData?.byPayment?.length > 0 && (
          <div className="mt-4 grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 mb-2 font-medium">By Payment Method</p>
              {dailyData.byPayment.map((p: any) => (
                <div key={p.method} className="flex justify-between text-sm py-1 border-b border-gray-100 last:border-0">
                  <span className="text-gray-600">{p.method}</span>
                  <span className="font-medium">{p._count} shipments · {formatETB(p._sum.amount)} ETB</span>
                </div>
              ))}
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-2 font-medium">By Service Type</p>
              {dailyData.byService.map((s: any) => (
                <div key={s.serviceType} className="flex justify-between text-sm py-1 border-b border-gray-100 last:border-0">
                  <span className="text-gray-600">{s.serviceType.replace('_', ' ')}</span>
                  <span className="font-medium">{s._count} shipments</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Range chart */}
      <div className="card p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Revenue Trend</h2>
          <div className="flex gap-2">
            {['week', 'month'].map(p => (
              <button key={p} onClick={() => { setPeriod(p); loadAll(dateInput, p); }}
                className={`px-3 py-1 rounded-lg text-xs font-medium ${period === p ? 'bg-brand-700 text-white' : 'bg-gray-100 text-gray-600'}`}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={rangeData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip formatter={(v: any) => [formatETB(v) + ' ETB', 'Revenue']} />
            <Line type="monotone" dataKey="revenue" stroke="#E85D04" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Staff performance */}
      {staffData.length > 0 && (
        <div className="card overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100"><h2 className="font-semibold text-gray-900">Staff Performance (Last 30 Days)</h2></div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>{['Staff Member', 'Email', 'Shipments', 'Revenue'].map(h => <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {staffData.map(s => (
                <tr key={s.staffId} className="hover:bg-gray-50">
                  <td className="px-4 py-2.5 font-medium text-sm">{s.name || '—'}</td>
                  <td className="px-4 py-2.5 text-xs text-gray-500">{s.email}</td>
                  <td className="px-4 py-2.5 text-sm">{s.shipments}</td>
                  <td className="px-4 py-2.5 text-sm font-semibold text-brand-700">{formatETB(s.revenue)} ETB</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
