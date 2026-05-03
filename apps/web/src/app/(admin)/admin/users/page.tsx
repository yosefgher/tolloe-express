'use client';
import { useEffect, useState } from 'react';
import { Users, Search } from 'lucide-react';
import { api } from '@/lib/api';
import { cn, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

const ROLE_COLORS: Record<string, string> = {
  ADMIN: 'bg-red-100 text-red-700',
  STAFF: 'bg-blue-100 text-blue-700',
  CUSTOMER: 'bg-gray-100 text-gray-700',
  BUSINESS_CLIENT: 'bg-purple-100 text-purple-700',
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Array<Record<string, unknown>>>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '20' });
    if (search) params.set('search', search);
    api.get(`/users?${params}`).then(r => { setUsers(r.data.data?.items || []); setTotal(r.data.data?.total || 0); }).finally(() => setLoading(false));
  }, [search, page]);

  async function toggleActive(id: string, current: boolean) {
    try {
      await api.put(`/users/${id}`, { isActive: !current });
      setUsers(u => u.map(x => x.id === id ? { ...x, isActive: !current } : x));
      toast.success(current ? 'User deactivated' : 'User activated');
    } catch { toast.error('Failed'); }
  }

  return (
    <div className="p-6 max-w-6xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">User Management</h1>
      <div className="relative max-w-sm mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search users..." className="input-field pl-9" />
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>{['Name', 'Email', 'Phone', 'Role', 'Status', 'Joined', 'Actions'].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>
              : users.map(u => (
                <tr key={u.id as string} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-xs font-medium text-gray-900">
                    {(u.profile as Record<string, string>)?.firstName} {(u.profile as Record<string, string>)?.lastName}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">{u.email as string}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{(u.phone as string) || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={cn('badge text-xs', ROLE_COLORS[u.role as string])}>{(u.role as string)?.replace('_', ' ')}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn('badge text-xs', u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">{formatDate(u.createdAt as string)}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleActive(u.id as string, u.isActive as boolean)} className={cn('text-xs px-2 py-1 rounded border', u.isActive ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-green-200 text-green-600 hover:bg-green-50')}>
                      {u.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {total > 20 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 text-sm">
            <p className="text-gray-500">{total} users total</p>
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
