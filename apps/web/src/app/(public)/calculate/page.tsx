import type { Metadata } from 'next';
import PriceCalculator from '@/components/calculator/PriceCalculator';

export const metadata: Metadata = { title: 'Price Calculator' };

export default function CalculatePage() {
  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Price Calculator</h1>
          <p className="text-gray-500 mt-2">Get an instant shipping cost estimate in ETB</p>
        </div>
        <PriceCalculator />
      </div>
    </div>
  );
}
