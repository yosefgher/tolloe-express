'use client';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const CITIES = [
  { name: 'Addis Ababa', lat: 9.032, lng: 38.7469, primary: true },
  { name: 'Dire Dawa', lat: 9.593, lng: 41.8661, primary: false },
  { name: 'Mekelle', lat: 13.4967, lng: 39.4753, primary: false },
  { name: 'Gondar', lat: 12.603, lng: 37.4521, primary: false },
  { name: 'Bahir Dar', lat: 11.5936, lng: 37.39, primary: false },
  { name: 'Hawassa', lat: 7.0621, lng: 38.4768, primary: false },
  { name: 'Jimma', lat: 7.6784, lng: 36.8344, primary: false },
  { name: 'Dessie', lat: 11.1333, lng: 39.6333, primary: false },
  { name: 'Jijiga', lat: 9.35, lng: 42.8, primary: false },
  { name: 'Adama', lat: 8.54, lng: 39.27, primary: false },
  { name: 'Bishoftu', lat: 8.75, lng: 38.9833, primary: false },
  { name: 'Harar', lat: 9.31, lng: 42.12, primary: false },
  { name: 'Arba Minch', lat: 6.0333, lng: 37.55, primary: false },
  { name: 'Nekemte', lat: 9.0847, lng: 36.5478, primary: false },
  { name: 'Shashamane', lat: 7.2, lng: 38.6, primary: false },
];

export default function CoverageMapInner() {
  return (
    <MapContainer
      center={[9.032, 38.7469]}
      zoom={6}
      style={{ height: '400px', width: '100%' }}
      className="rounded-xl"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {CITIES.map((city) => (
        <CircleMarker
          key={city.name}
          center={[city.lat, city.lng]}
          radius={city.primary ? 12 : 8}
          fillColor={city.primary ? '#E85D04' : '#f97316'}
          color="white"
          weight={2}
          fillOpacity={0.9}
        >
          <Popup>
            <strong>{city.name}</strong>
            {city.primary && <><br /><span style={{ color: '#E85D04', fontSize: '0.75rem' }}>Main Hub</span></>}
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
