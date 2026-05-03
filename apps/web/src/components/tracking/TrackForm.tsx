'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function TrackForm({ dark = false }: { dark?: boolean }) {
  const router = useRouter();
  const [value, setValue] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const tn = value.trim().toUpperCase();
    if (tn) router.push(`/track/${tn}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Enter tracking number (e.g. TE-20260503-A7K2PQ)"
        className={cn(
          'flex-1 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500',
          dark
            ? 'bg-white/10 border border-white/20 text-white placeholder-gray-400'
            : 'border border-gray-300 text-gray-900'
        )}
      />
      <button type="submit" className="btn-primary flex items-center gap-2 shrink-0">
        <Search className="w-4 h-4" />
        <span className="hidden sm:inline">Track</span>
      </button>
    </form>
  );
}
