'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { ChevronRight, ChevronLeft, Package, MapPin, CreditCard, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

const schema = z.object({
  recipientEmail: z.string().email('Valid recipient email required'),
  serviceType: z.enum(['SAME_DAY', 'EXPRESS', 'STANDARD', 'ECONOMY']),
  weight: z.coerce.number().positive('Weight must be greater than 0'),
  notes: z.string().optional(),
  isCOD: z.boolean().default(false),
  promoCode: z.string().optional(),
  pickupStreet: z.string().min(1, 'Street is required'),
  pickupCity: z.string().min(1, 'City is required'),
  pickupRegion: z.string().min(1, 'Region is required'),
  deliveryStreet: z.string().min(1, 'Street is required'),
  deliveryCity: z.string().min(1, 'City is required'),
  deliveryRegion: z.string().min(1, 'Region is required'),
});

type FormData = z.infer<typeof schema>;

const STEPS = ['Package Details', 'Pickup Address', 'Delivery Address', 'Review & Pay'];

const ETHIOPIAN_CITIES = [
  'Addis Ababa', 'Dire Dawa', 'Mekelle', 'Gondar', 'Bahir Dar', 'Hawassa',
  'Jimma', 'Dessie', 'Jijiga', 'Shashamane', 'Bishoftu', 'Adama', 'Harar',
  'Arba Minch', 'Nekemte',
];

export default function BookingForm() {
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuthStore();
  const router = useRouter();

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { serviceType: 'STANDARD', isCOD: false },
  });

  const watched = watch();

  async function onSubmit(data: FormData) {
    if (!user) { router.push('/login?redirect=/book'); return; }
    setIsLoading(true);
    try {
      const res = await api.post('/shipments', {
        recipientEmail: data.recipientEmail,
        serviceType: data.serviceType,
        weight: data.weight,
        notes: data.notes,
        isCOD: data.isCOD,
        promoCode: data.promoCode || undefined,
        pickupAddress: { street: data.pickupStreet, city: data.pickupCity, region: data.pickupRegion },
        deliveryAddress: { street: data.deliveryStreet, city: data.deliveryCity, region: data.deliveryRegion },
      });
      const shipment = res.data.data;
      toast.success(`Shipment booked! Tracking: ${shipment.trackingNumber}`);
      router.push(`/track/${shipment.trackingNumber}`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } }).response?.data?.error || 'Booking failed';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }

  function nextStep() { setStep((s) => Math.min(s + 1, STEPS.length - 1)); }
  function prevStep() { setStep((s) => Math.max(s - 1, 0)); }

  return (
    <div className="card">
      {/* Step indicator */}
      <div className="px-6 pt-6 pb-4 border-b border-gray-100">
        <div className="flex items-center">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center flex-1">
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all shrink-0',
                i < step ? 'bg-green-500 text-white' : i === step ? 'bg-brand-700 text-white' : 'bg-gray-200 text-gray-500'
              )}>
                {i < step ? '✓' : i + 1}
              </div>
              <span className={cn('hidden sm:block ml-2 text-xs font-medium', i === step ? 'text-brand-700' : 'text-gray-400')}>
                {label}
              </span>
              {i < STEPS.length - 1 && (
                <div className={cn('flex-1 h-0.5 mx-2', i < step ? 'bg-green-500' : 'bg-gray-200')} />
              )}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-6">
        {/* Step 0: Package Details */}
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><Package className="w-5 h-5 text-brand-700" />Package Details</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Recipient Email *</label>
              <input {...register('recipientEmail')} type="email" className="input-field" placeholder="recipient@example.com" />
              {errors.recipientEmail && <p className="text-red-500 text-xs mt-1">{errors.recipientEmail.message}</p>}
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Service Type *</label>
                <select {...register('serviceType')} className="input-field">
                  <option value="SAME_DAY">Same Day (200 ETB base)</option>
                  <option value="EXPRESS">Express (120 ETB base)</option>
                  <option value="STANDARD">Standard (80 ETB base)</option>
                  <option value="ECONOMY">Economy (50 ETB base)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg) *</label>
                <input {...register('weight')} type="number" step="0.1" min="0.1" className="input-field" placeholder="1.5" />
                {errors.weight && <p className="text-red-500 text-xs mt-1">{errors.weight.message}</p>}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
              <textarea {...register('notes')} className="input-field h-20 resize-none" placeholder="Fragile, handle with care..." />
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <input {...register('isCOD')} type="checkbox" id="cod" className="w-4 h-4 text-brand-700" />
              <label htmlFor="cod" className="text-sm text-gray-700">Cash on Delivery (+30 ETB surcharge)</label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Promo Code (optional)</label>
              <input {...register('promoCode')} className="input-field" placeholder="WELCOME10" />
            </div>
          </div>
        )}

        {/* Step 1: Pickup Address */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><MapPin className="w-5 h-5 text-green-600" />Pickup Address</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Street Address *</label>
              <input {...register('pickupStreet')} className="input-field" placeholder="Bole Road, House 42" />
              {errors.pickupStreet && <p className="text-red-500 text-xs mt-1">{errors.pickupStreet.message}</p>}
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                <select {...register('pickupCity')} className="input-field">
                  <option value="">Select city</option>
                  {ETHIOPIAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.pickupCity && <p className="text-red-500 text-xs mt-1">{errors.pickupCity.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Region *</label>
                <input {...register('pickupRegion')} className="input-field" placeholder="Addis Ababa" />
                {errors.pickupRegion && <p className="text-red-500 text-xs mt-1">{errors.pickupRegion.message}</p>}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Delivery Address */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><MapPin className="w-5 h-5 text-brand-700" />Delivery Address</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Street Address *</label>
              <input {...register('deliveryStreet')} className="input-field" placeholder="Recipient street address" />
              {errors.deliveryStreet && <p className="text-red-500 text-xs mt-1">{errors.deliveryStreet.message}</p>}
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                <select {...register('deliveryCity')} className="input-field">
                  <option value="">Select city</option>
                  {ETHIOPIAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.deliveryCity && <p className="text-red-500 text-xs mt-1">{errors.deliveryCity.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Region *</label>
                <input {...register('deliveryRegion')} className="input-field" placeholder="Oromia" />
                {errors.deliveryRegion && <p className="text-red-500 text-xs mt-1">{errors.deliveryRegion.message}</p>}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><CheckCircle className="w-5 h-5 text-green-600" />Review Your Shipment</h2>
            <div className="bg-gray-50 rounded-xl p-4 space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Recipient</span><span className="font-medium">{watched.recipientEmail}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Service</span><span className="font-medium">{watched.serviceType}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Weight</span><span className="font-medium">{watched.weight} kg</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Pickup</span><span className="font-medium">{watched.pickupCity}, {watched.pickupRegion}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Delivery</span><span className="font-medium">{watched.deliveryCity}, {watched.deliveryRegion}</span></div>
              {watched.isCOD && <div className="flex justify-between text-orange-600"><span>COD Surcharge</span><span>+30 ETB</span></div>}
            </div>
            {!user && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
                You need to <a href="/login?redirect=/book" className="underline font-medium">log in</a> to complete your booking.
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
          {step > 0 ? (
            <button type="button" onClick={prevStep} className="btn-secondary flex items-center gap-2">
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
          ) : <div />}
          {step < STEPS.length - 1 ? (
            <button type="button" onClick={nextStep} className="btn-primary flex items-center gap-2">
              Next <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button type="submit" disabled={isLoading} className="btn-primary flex items-center gap-2">
              {isLoading ? 'Booking...' : 'Confirm Booking'} <CheckCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
