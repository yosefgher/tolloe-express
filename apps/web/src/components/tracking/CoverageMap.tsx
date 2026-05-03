'use client';
import dynamic from 'next/dynamic';

const Map = dynamic(() => import('./_CoverageMapInner'), { ssr: false, loading: () => (
  <div className="h-80 bg-gray-100 flex items-center justify-center rounded-xl">
    <p className="text-gray-500 text-sm">Loading map...</p>
  </div>
)});

export default function CoverageMap() {
  return <Map />;
}
