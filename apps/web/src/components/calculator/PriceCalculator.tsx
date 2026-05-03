'use client';
import { useState } from 'react';
import { Calculator, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { formatETB } from '@/lib/utils';
import Link from 'next/link';

const CITIES = [
  'Addis Ababa', 'Dire Dawa', 'Mekelle', 'Gondar', 'Bahir Dar', 'Hawassa',
  'Jimma', 'Dessie', 'Jijiga', 'Shashamane', 'Bishoftu', 'Adama', 'Harar',
  'Arba Minch', 'Nekemte',
];

interface Estimate {
  baseRate: number;
  weightCharge: number;
  distanceCharge: number;
  codSurcharge: number;
  total: number;
  currency: string;
  estimatedDays: number;
}

export default function PriceCalculator() {
  const [form, setForm] = useState({ originCity: '', destinationCity: '', weight: '', serviceType: 'STANDARD', isCOD: false });
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleCalculate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.originCity || !form.destinationCity || !form.weight) {
      toast.error('Please fill all required fields'); return;
    }
    setLoading(true);
    try {
      const res = await api.post('/calculator/estimate', {
        originCity: form.originCity,
        destinationCity: form.destinationCity,
        weight: parseFloat(form.weight),
        serviceType: form.serviceType,
        isCOD: form.isCOD,
      });
      setEstimate(res.data.data);
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { error?: string } } }).response?.data?.error || 'Calculation failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <form onSubmit={handleCalculate} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From (Origin City) *</label>
              <select value={form.originCity} onChange={e => setForm(f => ({ ...f, originCity: e.target.value }))} className="input-field">
                <option value="">Select origin</option>
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To (Destination City) *</label>
              <select value={form.destinationCity} onChange={e => setForm(f => ({ ...f, destinationCity: e.target.value }))} className="input-field">
                <option value="">Select destination</option>
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg) *</label>
              <input type="number" step="0.1" min="0.1" value={form.weight} onChange={e => setForm(f => ({ ...f, weight: e.target.value }))} className="input-field" placeholder="1.5" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Service Type *</label>
              <select value={form.serviceType} onChange={e => setForm(f => ({ ...f, serviceType: e.target.value }))} className="input-field">
                <option value="SAME_DAY">Same Day</option>
                <option value="EXPRESS">Express</option>
                <option value="STANDARD">Standard</option>
                <option value="ECONOMY">Economy</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <input type="checkbox" id="cod" checked={form.isCOD} onChange={e => setForm(f => ({ ...f, isCOD: e.target.checked }))} className="w-4 h-4 text-brand-700" />
            <label htmlFor="cod" className="text-sm text-gray-700">Include Cash on Delivery</label>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
            <Calculator className="w-4 h-4" />
            {loading ? 'Calculating...' : 'Calculate Price'}
          </button>
        </form>
      </div>

      {estimate && (
        <div className="card p-6 animate-fade-in">
          <h3 className="font-semibold text-gray-900 mb-4">Price Breakdown</h3>
          <div className="space-y-3">
            {[
              { label: 'Base Rate', value: estimate.baseRate },
              { label: 'Weight Charge', value: estimate.weightCharge },
              { label: 'Distance Charge', value: estimate.distanceCharge },
              ...(estimate.codSurcharge > 0 ? [{ label: 'COD Surcharge', value: estimate.codSurcharge }] : []),
            ].map(item => (
              <div key={item.label} className="flex justify-between text-sm">
                <span className="text-gray-500">{item.label}</span>
                <span className="font-medium">{formatETB(item.value)}</span>
              </div>
            ))}
            <div className="border-t border-gray-200 pt-3 flex justify-between">
              <span className="font-semibold text-gray-900">Total</span>
              <span className="font-bold text-xl text-brand-700">{formatETB(estimate.total)}</span>
            </div>
            <p className="text-xs text-gray-400">Estimated delivery: {estimate.estimatedDays} business day{estimate.estimatedDays !== 1 ? 's' : ''}</p>
          </div>
          <Link href="/book" className="btn-primary w-full mt-4 flex items-center justify-center gap-2">
            Book This Shipment <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
