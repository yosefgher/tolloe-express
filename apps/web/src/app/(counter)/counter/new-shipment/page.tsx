'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { formatETB } from '@/lib/utils';
import toast from 'react-hot-toast';
import { CheckCircle, Printer, X, ArrowLeft } from 'lucide-react';

const CITIES = [
  'Addis Ababa', 'Dire Dawa', 'Mekelle', 'Gondar', 'Bahir Dar',
  'Hawassa', 'Jimma', 'Adama', 'Harar', 'Bishoftu',
  'Jijiga', 'Dessie', 'Arba Minch', 'Nekemte', 'Shashamane',
];

const SERVICE_OPTIONS = [
  { value: 'SAME_DAY', label: 'Same Day', days: 'Today' },
  { value: 'EXPRESS', label: 'Express', days: '1–2 days' },
  { value: 'STANDARD', label: 'Standard', days: '3–5 days' },
  { value: 'ECONOMY', label: 'Economy', days: '5–7 days' },
];

const PAYMENT_OPTIONS = [
  { value: 'CASH', label: 'Cash' },
  { value: 'CARD', label: 'POS' },
  { value: 'MOBILE_MONEY', label: 'Mobile Payment' },
  { value: 'COD', label: 'COD' },
];

const PACKAGE_TYPES = ['Document', 'Parcel', 'Fragile', 'Electronics', 'Clothing', 'Food'];

const EMPTY_FORM = {
  senderName: '', senderPhone: '', senderIdNumber: '', senderCity: 'Addis Ababa',
  recipientName: '', recipientPhone: '', recipientCity: '', recipientStreet: '',
  weight: '', packageType: 'Document',
  serviceType: 'EXPRESS', paymentMethod: 'CASH', isCOD: false, codAmount: '',
  promoCode: '', notes: '',
};

export default function NewShipmentPage() {
  const router = useRouter();
  const [form, setForm] = useState(EMPTY_FORM);
  const [estimate, setEstimate] = useState<any>(null);
  const [loadingEstimate, setLoadingEstimate] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [createdShipment, setCreatedShipment] = useState<any>(null);

  function set(field: string, value: any) {
    setForm(f => ({ ...f, [field]: value }));
  }

  const fetchEstimate = useCallback(async (f: typeof form) => {
    if (!f.weight || !f.senderCity || !f.recipientCity || parseFloat(f.weight) <= 0) return;
    setLoadingEstimate(true);
    try {
      const res = await api.post('/calculator/estimate', {
        originCity: f.senderCity,
        destinationCity: f.recipientCity,
        weight: parseFloat(f.weight),
        serviceType: f.serviceType,
        isCOD: f.isCOD,
      });
      setEstimate(res.data.data);
    } catch {
      setEstimate(null);
    } finally {
      setLoadingEstimate(false);
    }
  }, []);

  // Auto-recalculate when relevant fields change
  useEffect(() => {
    const timer = setTimeout(() => fetchEstimate(form), 400);
    return () => clearTimeout(timer);
  }, [form.weight, form.senderCity, form.recipientCity, form.serviceType, form.isCOD]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.senderName || !form.senderPhone || !form.recipientName || !form.recipientPhone || !form.recipientCity || !form.weight) {
      toast.error('Please fill in all required fields');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post('/counter/shipments', {
        senderName: form.senderName,
        senderPhone: form.senderPhone,
        senderEmail: `${form.senderPhone.replace(/\s/g, '')}@counter.toloeexpress.com`,
        pickupAddress: { street: '', city: form.senderCity, region: form.senderCity, country: 'Ethiopia' },
        recipientName: form.recipientName,
        recipientPhone: form.recipientPhone,
        recipientEmail: `${form.recipientPhone.replace(/\s/g, '')}@counter.toloeexpress.com`,
        deliveryAddress: { street: form.recipientStreet || '', city: form.recipientCity, region: form.recipientCity, country: 'Ethiopia' },
        weight: parseFloat(form.weight),
        serviceType: form.serviceType,
        paymentMethod: form.isCOD ? 'COD' : form.paymentMethod,
        isCOD: form.isCOD,
        codAmount: form.isCOD && form.codAmount ? parseFloat(form.codAmount) : undefined,
        promoCode: form.promoCode || undefined,
        notes: `[${form.packageType.toUpperCase()}]${form.notes ? ' ' + form.notes : ''}${form.senderIdNumber ? ' ID:' + form.senderIdNumber : ''}`,
      });
      setCreatedShipment(res.data.data);
      toast.success('Shipment created!');
    } catch (e: any) {
      toast.error(e.response?.data?.error || 'Failed to create shipment');
    } finally {
      setSubmitting(false);
    }
  }

  function handleNew() {
    setForm(EMPTY_FORM);
    setEstimate(null);
    setCreatedShipment(null);
  }

  const lbl = 'block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide';
  const inp = 'w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white';

  // ── Receipt screen ──────────────────────────────────────────────────────────
  if (createdShipment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-9 h-9 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Shipment Accepted</h2>
          <p className="text-sm text-gray-400 mb-6">Receipt ready to print</p>

          <div className="bg-gray-50 rounded-xl p-5 text-left space-y-3 mb-6 border border-gray-100">
            <div className="text-center pb-3 border-b border-dashed border-gray-200">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Tracking Number</p>
              <p className="text-2xl font-bold font-mono text-brand-700">{createdShipment.trackingNumber}</p>
            </div>
            <div className="grid grid-cols-2 gap-y-2.5 text-sm">
              <div><p className="text-xs text-gray-400">Sender</p><p className="font-semibold">{form.senderName}</p></div>
              <div><p className="text-xs text-gray-400">Receiver</p><p className="font-semibold">{form.recipientName}</p></div>
              <div><p className="text-xs text-gray-400">From</p><p className="font-medium">{form.senderCity}</p></div>
              <div><p className="text-xs text-gray-400">To</p><p className="font-medium">{form.recipientCity}</p></div>
              <div><p className="text-xs text-gray-400">Service</p><p className="font-medium">{form.serviceType.replace('_', ' ')}</p></div>
              <div><p className="text-xs text-gray-400">Weight</p><p className="font-medium">{form.weight} kg</p></div>
              <div><p className="text-xs text-gray-400">Package</p><p className="font-medium">{form.packageType}</p></div>
              <div><p className="text-xs text-gray-400">Payment</p><p className="font-medium">{form.isCOD ? 'COD' : form.paymentMethod.replace('_', ' ')}</p></div>
            </div>
            <div className="border-t border-dashed border-gray-200 pt-3 flex justify-between items-center">
              <span className="font-bold text-gray-700">Total Charged</span>
              <span className="text-xl font-bold text-brand-700">{formatETB(createdShipment.totalPrice)} ETB</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => window.print()} className="flex-1 flex items-center justify-center gap-2 border border-gray-200 rounded-xl py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
              <Printer className="w-4 h-4" /> Print Receipt
            </button>
            <button onClick={handleNew} className="flex-1 bg-brand-700 hover:bg-brand-800 text-white rounded-xl py-2.5 text-sm font-semibold transition-colors">
              New Shipment
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Main form ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.push('/counter')} className="text-gray-400 hover:text-gray-600 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">ACCEPT NEW SHIPMENT</h1>
        </div>

        <form onSubmit={handleSubmit}>
          {/* ── Row 1: Sender + Receiver ── */}
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            {/* Sender */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-bold text-gray-900 mb-4">Sender</h2>
              <div className="space-y-3">
                <div>
                  <label className={lbl}>Sender Name <span className="text-red-400">*</span></label>
                  <input className={inp} value={form.senderName} onChange={e => set('senderName', e.target.value)} placeholder="Full name" required />
                </div>
                <div>
                  <label className={lbl}>Sender Phone <span className="text-red-400">*</span></label>
                  <input className={inp} value={form.senderPhone} onChange={e => set('senderPhone', e.target.value)} placeholder="+251 9XX XXX XXX" required />
                </div>
                <div>
                  <label className={lbl}>Sender ID</label>
                  <input className={inp} value={form.senderIdNumber} onChange={e => set('senderIdNumber', e.target.value)} placeholder="National ID / Passport" />
                </div>
                <div>
                  <label className={lbl}>From City <span className="text-red-400">*</span></label>
                  <select className={inp} value={form.senderCity} onChange={e => set('senderCity', e.target.value)}>
                    {CITIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Receiver */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-bold text-gray-900 mb-4">Receiver</h2>
              <div className="space-y-3">
                <div>
                  <label className={lbl}>Receiver Name <span className="text-red-400">*</span></label>
                  <input className={inp} value={form.recipientName} onChange={e => set('recipientName', e.target.value)} placeholder="Full name" required />
                </div>
                <div>
                  <label className={lbl}>Receiver Phone <span className="text-red-400">*</span></label>
                  <input className={inp} value={form.recipientPhone} onChange={e => set('recipientPhone', e.target.value)} placeholder="+251 9XX XXX XXX" required />
                </div>
                <div>
                  <label className={lbl}>Destination City <span className="text-red-400">*</span></label>
                  <select className={inp} value={form.recipientCity} onChange={e => set('recipientCity', e.target.value)} required>
                    <option value="">Select city…</option>
                    {CITIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className={lbl}>Address</label>
                  <input className={inp} value={form.recipientStreet} onChange={e => set('recipientStreet', e.target.value)} placeholder="Street / House number" />
                </div>
              </div>
            </div>
          </div>

          {/* ── Row 2: Package + Service + Payment ── */}
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            {/* Package Details */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-bold text-gray-900 mb-4">Package Details</h2>
              <div className="space-y-3">
                <div>
                  <label className={lbl}>Weight <span className="text-red-400">*</span></label>
                  <div className="relative">
                    <input
                      className={inp + ' pr-10'}
                      type="number" step="0.1" min="0.1"
                      value={form.weight}
                      onChange={e => set('weight', e.target.value)}
                      placeholder="0.0"
                      required
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-semibold">kg</span>
                  </div>
                </div>
                <div>
                  <label className={lbl}>Size / Type</label>
                  <select className={inp} value={form.packageType} onChange={e => set('packageType', e.target.value)}>
                    {PACKAGE_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className={lbl}>Promo Code</label>
                  <input className={inp} value={form.promoCode} onChange={e => set('promoCode', e.target.value)} placeholder="Optional" />
                </div>
              </div>
            </div>

            {/* Service Type */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-bold text-gray-900 mb-4">Service Type</h2>
              <div className="space-y-2 mb-4">
                {SERVICE_OPTIONS.map(opt => (
                  <label key={opt.value} className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-colors ${form.serviceType === opt.value ? 'border-brand-600 bg-brand-50' : 'border-gray-100 hover:border-gray-200'}`}>
                    <div className="flex items-center gap-2.5">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${form.serviceType === opt.value ? 'border-brand-600' : 'border-gray-300'}`}>
                        {form.serviceType === opt.value && <div className="w-2 h-2 rounded-full bg-brand-600" />}
                      </div>
                      <div>
                        <p className={`text-sm font-semibold ${form.serviceType === opt.value ? 'text-brand-700' : 'text-gray-700'}`}>{opt.label}</p>
                        <p className="text-xs text-gray-400">{opt.days}</p>
                      </div>
                    </div>
                    <input type="radio" className="sr-only" name="serviceType" value={opt.value} checked={form.serviceType === opt.value} onChange={() => set('serviceType', opt.value)} />
                  </label>
                ))}
              </div>
              {/* Price */}
              <div className="border-t border-gray-100 pt-3">
                {loadingEstimate ? (
                  <div className="text-center text-xs text-gray-400">Calculating…</div>
                ) : estimate ? (
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm font-semibold text-gray-600">Total:</span>
                    <span className="text-2xl font-bold text-gray-900">{formatETB(estimate.total)} <span className="text-sm font-normal text-gray-400">ETB</span></span>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 text-center">Fill weight & cities to see price</p>
                )}
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-bold text-gray-900 mb-4">Payment Method</h2>
              <div className="space-y-2">
                {PAYMENT_OPTIONS.map(opt => (
                  <label key={opt.value} className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-colors ${form.paymentMethod === opt.value && !form.isCOD ? 'border-brand-600 bg-brand-50' : 'border-gray-100 hover:border-gray-200'} ${form.isCOD && opt.value !== 'COD' ? 'opacity-40' : ''}`}>
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${form.paymentMethod === opt.value && !form.isCOD ? 'border-brand-600' : form.isCOD && opt.value === 'COD' ? 'border-brand-600' : 'border-gray-300'}`}>
                      {((form.paymentMethod === opt.value && !form.isCOD) || (form.isCOD && opt.value === 'COD')) && (
                        <div className="w-2 h-2 rounded-full bg-brand-600" />
                      )}
                    </div>
                    <span className={`text-sm font-medium ${(form.paymentMethod === opt.value && !form.isCOD) || (form.isCOD && opt.value === 'COD') ? 'text-brand-700' : 'text-gray-700'}`}>{opt.label}</span>
                    <input type="radio" className="sr-only" name="paymentMethod" value={opt.value}
                      checked={opt.value === 'COD' ? form.isCOD : form.paymentMethod === opt.value && !form.isCOD}
                      onChange={() => {
                        if (opt.value === 'COD') { set('isCOD', true); set('paymentMethod', 'COD'); }
                        else { set('isCOD', false); set('paymentMethod', opt.value); }
                      }} />
                  </label>
                ))}
              </div>
              {form.isCOD && (
                <div className="mt-3">
                  <label className={lbl}>COD Amount (ETB)</label>
                  <input className={inp} type="number" value={form.codAmount} onChange={e => set('codAmount', e.target.value)} placeholder="0.00" />
                </div>
              )}
              <div className="mt-3">
                <label className={lbl}>Notes</label>
                <textarea className={inp + ' resize-none h-16'} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Handle with care…" />
              </div>
            </div>
          </div>

          {/* ── Action buttons ── */}
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => router.push('/counter')} className="flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
              <X className="w-4 h-4" /> Cancel
            </button>
            <button type="submit" disabled={submitting} className="flex items-center gap-2 px-8 py-3 rounded-xl bg-brand-700 hover:bg-brand-800 text-white text-sm font-semibold transition-colors disabled:opacity-50">
              <CheckCircle className="w-4 h-4" />
              {submitting ? 'Creating…' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
