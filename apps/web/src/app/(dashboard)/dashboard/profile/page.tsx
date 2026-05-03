'use client';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';

export default function ProfilePage() {
  const { user, setAuth } = useAuthStore();
  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    defaultValues: {
      firstName: user?.profile?.firstName || '',
      lastName: user?.profile?.lastName || '',
      phone: user?.phone || '',
    },
  });

  async function onSubmit(data: { firstName: string; lastName: string; phone: string }) {
    try {
      const res = await api.put(`/users/${user?.id}`, { phone: data.phone, profile: { firstName: data.firstName, lastName: data.lastName } });
      setAuth(res.data.data, (window as { __accessToken?: string }).__accessToken || '');
      toast.success('Profile updated!');
    } catch { toast.error('Update failed'); }
  }

  return (
    <div className="p-6 max-w-lg">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>
      <div className="card p-6">
        <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mb-4">
          <span className="text-2xl font-bold text-brand-700">
            {user?.profile?.firstName?.[0]?.toUpperCase()}
          </span>
        </div>
        <p className="text-sm text-gray-500 mb-6">{user?.email} · <span className="capitalize">{user?.role?.toLowerCase().replace('_', ' ')}</span></p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input {...register('firstName')} className="input-field" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input {...register('lastName')} className="input-field" /></div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input {...register('phone')} type="tel" className="input-field" placeholder="+251 9..." /></div>
          <button type="submit" disabled={isSubmitting} className="btn-primary">
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
