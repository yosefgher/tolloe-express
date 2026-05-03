'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Plus, History, Clock, LogOut, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

const navItems = [
  { href: '/counter', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/counter/new-shipment', icon: Plus, label: 'New Shipment' },
  { href: '/counter/history', icon: History, label: "Today's History" },
  { href: '/counter/shift', icon: Clock, label: 'Shift / Cash' },
];

export default function CounterSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();

  async function handleLogout() {
    try { await api.post('/auth/logout'); } catch {}
    clearAuth(); toast.success('Logged out'); router.push('/');
  }

  return (
    <aside className="w-56 shrink-0 bg-gray-900 text-gray-300 min-h-screen flex flex-col">
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-brand-700 rounded-lg flex items-center justify-center">
            <Package className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-sm text-white">Counter POS</span>
        </div>
        <span className="text-xs text-gray-500 mt-1 block">{user?.profile ? `${(user as any).profile?.firstName} ${(user as any).profile?.lastName}` : user?.email}</span>
      </div>
      <nav className="flex-1 p-3 space-y-0.5">
        {navItems.map(item => (
          <Link key={item.href} href={item.href}
            className={cn('flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              pathname === item.href || (item.href !== '/counter' && pathname.startsWith(item.href))
                ? 'bg-brand-700 text-white' : 'hover:bg-gray-800 hover:text-white')}>
            <item.icon className="w-4 h-4 shrink-0" />{item.label}
          </Link>
        ))}
      </nav>
      <div className="p-3 border-t border-gray-800">
        <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-red-900/30 hover:text-red-400 w-full transition-colors">
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </aside>
  );
}
