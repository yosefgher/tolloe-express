'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Package, LayoutDashboard, Upload, FileText, Code, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

const navItems = [
  { href: '/business', icon: LayoutDashboard, label: 'Overview' },
  { href: '/business/shipments', icon: Package, label: 'Shipments' },
  { href: '/business/bulk-upload', icon: Upload, label: 'Bulk Upload' },
  { href: '/business/invoices', icon: FileText, label: 'Invoices' },
  { href: '/business/api', icon: Code, label: 'API & Webhooks' },
];

export default function BusinessSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();

  async function handleLogout() {
    try { await api.post('/auth/logout'); } catch {}
    clearAuth(); toast.success('Logged out'); router.push('/');
  }

  return (
    <aside className="w-64 shrink-0 bg-white border-r border-gray-100 min-h-screen flex flex-col">
      <div className="p-4 border-b border-gray-100">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-brand-700 rounded-lg flex items-center justify-center">
            <Package className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-sm">TOLLOE <span className="text-brand-700">EXPRESS</span></span>
        </Link>
      </div>
      <div className="p-3 border-b border-gray-100">
        <div className="px-2 py-1">
          <p className="text-xs font-medium text-gray-900 truncate">{user?.profile ? `${user.profile.firstName} ${user.profile.lastName}` : user?.email}</p>
          <p className="text-xs text-gray-500">Business Client</p>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(item => (
          <Link key={item.href} href={item.href} className={cn('flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors', pathname === item.href ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-gray-50')}>
            <item.icon className="w-4 h-4 shrink-0" />{item.label}
          </Link>
        ))}
      </nav>
      <div className="p-3 border-t border-gray-100">
        <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 w-full">
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </aside>
  );
}
