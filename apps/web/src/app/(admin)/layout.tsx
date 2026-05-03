'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/layout/AdminSidebar';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, setAuth, clearAuth } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      api.post('/auth/refresh').then(res => {
        const token = res.data.data.accessToken;
        return api.get('/auth/me').then(meRes => setAuth(meRes.data.data, token));
      }).catch(() => { clearAuth(); router.push('/login?redirect=/admin'); });
    } else if (!['ADMIN', 'STAFF'].includes(user.role)) {
      router.push('/dashboard');
    }
  }, []);

  if (isLoading || !user) return <div className="min-h-screen flex items-center justify-center bg-gray-900"><div className="w-8 h-8 border-2 border-brand-700 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="hidden md:block"><AdminSidebar /></div>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
