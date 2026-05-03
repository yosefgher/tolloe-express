'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, setAuth, clearAuth, setLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      api.post('/auth/refresh')
        .then(res => {
          const token = res.data.data.accessToken;
          return api.get('/auth/me', { headers: { Authorization: `Bearer ${token}` } })
            .then(meRes => setAuth(meRes.data.data, token));
        })
        .catch(() => {
          clearAuth();
          router.push('/login?redirect=/dashboard');
        });
    }
  }, []);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-8 h-8 border-2 border-brand-700 border-t-transparent rounded-full animate-spin" />
    </div>;
  }

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile: show sidebar as offcanvas — simplified for now */}
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <main className="flex-1 overflow-auto">
        <div className="md:hidden p-4 bg-white border-b border-gray-100 flex items-center gap-3">
          <span className="font-bold text-sm">TOLLOE EXPRESS</span>
        </div>
        {children}
      </main>
    </div>
  );
}
