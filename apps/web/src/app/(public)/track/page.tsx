import type { Metadata } from 'next';
import TrackForm from '@/components/tracking/TrackForm';
import { Search, Package } from 'lucide-react';

export const metadata: Metadata = { title: 'Track Your Package' };

export default function TrackPage() {
  return (
    <div className="min-h-[60vh] bg-gray-50 flex items-center">
      <div className="max-w-2xl mx-auto px-4 py-20 text-center w-full">
        <div className="w-16 h-16 bg-brand-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Package className="w-8 h-8 text-brand-700" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Track Your Package</h1>
        <p className="text-gray-500 mb-8">
          Enter your tracking number to see real-time status updates
        </p>
        <div className="card p-6">
          <TrackForm />
          <p className="text-xs text-gray-400 mt-3 text-center">
            Tracking numbers look like: <code className="bg-gray-100 px-1 rounded">TE-20260503-A7K2PQ</code>
          </p>
        </div>
      </div>
    </div>
  );
}
