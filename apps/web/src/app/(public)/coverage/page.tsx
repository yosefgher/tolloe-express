import type { Metadata } from 'next';
import { MapPin } from 'lucide-react';
import CoverageMap from '@/components/tracking/CoverageMap';

export const metadata: Metadata = { title: 'Service Coverage Areas' };

const cities = [
  { name: 'Addis Ababa', region: 'Addis Ababa', services: ['Same-Day', 'Express', 'Standard', 'Economy'] },
  { name: 'Dire Dawa', region: 'Dire Dawa', services: ['Express', 'Standard', 'Economy'] },
  { name: 'Mekelle', region: 'Tigray', services: ['Express', 'Standard', 'Economy'] },
  { name: 'Gondar', region: 'Amhara', services: ['Express', 'Standard', 'Economy'] },
  { name: 'Bahir Dar', region: 'Amhara', services: ['Express', 'Standard', 'Economy'] },
  { name: 'Hawassa', region: 'Sidama', services: ['Express', 'Standard', 'Economy'] },
  { name: 'Jimma', region: 'Oromia', services: ['Standard', 'Economy'] },
  { name: 'Dessie', region: 'Amhara', services: ['Standard', 'Economy'] },
  { name: 'Adama', region: 'Oromia', services: ['Express', 'Standard', 'Economy'] },
  { name: 'Bishoftu', region: 'Oromia', services: ['Express', 'Standard', 'Economy'] },
  { name: 'Harar', region: 'Harari', services: ['Standard', 'Economy'] },
  { name: 'Jijiga', region: 'Somali', services: ['Standard', 'Economy'] },
  { name: 'Arba Minch', region: 'SNNPR', services: ['Standard', 'Economy'] },
  { name: 'Nekemte', region: 'Oromia', services: ['Standard', 'Economy'] },
  { name: 'Shashamane', region: 'Oromia', services: ['Standard', 'Economy'] },
];

export default function CoveragePage() {
  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900">Service Coverage Areas</h1>
          <p className="text-gray-500 mt-2">We deliver to 15+ cities across Ethiopia</p>
        </div>

        <div className="card overflow-hidden mb-8">
          <CoverageMap />
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-4">Covered Cities</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cities.map((city) => (
            <div key={city.name} className="card p-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-brand-700 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">{city.name}</p>
                  <p className="text-xs text-gray-500 mb-2">{city.region}</p>
                  <div className="flex flex-wrap gap-1">
                    {city.services.map(s => (
                      <span key={s} className="badge bg-brand-50 text-brand-700 text-xs">{s}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
