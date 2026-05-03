import type { Metadata } from 'next';
import { MapPin, Clock, Briefcase } from 'lucide-react';
export const metadata: Metadata = { title: 'Careers' };

const openings = [
  { title: 'Delivery Driver', location: 'Addis Ababa', type: 'Full-time', dept: 'Operations', desc: 'Join our growing fleet and deliver packages across Addis Ababa. Motorcycle or car required.' },
  { title: 'Customer Support Specialist', location: 'Addis Ababa', type: 'Full-time', dept: 'Customer Service', desc: 'Help our customers track packages, resolve issues, and provide excellent service by phone and chat.' },
  { title: 'Software Engineer (Full Stack)', location: 'Remote / Addis Ababa', type: 'Full-time', dept: 'Technology', desc: 'Build and improve our web platform using React, Node.js, and PostgreSQL.' },
  { title: 'Operations Coordinator', location: 'Addis Ababa', type: 'Full-time', dept: 'Operations', desc: 'Coordinate daily shipments, manage driver assignments, and optimize delivery routes.' },
  { title: 'Business Development Manager', location: 'Addis Ababa', type: 'Full-time', dept: 'Sales', desc: 'Acquire and manage corporate accounts. Drive revenue growth through B2B partnerships.' },
];

export default function CareersPage() {
  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Join Our Team</h1>
          <p className="text-gray-500 max-w-xl mx-auto">Help us build Ethiopia's most reliable courier network. We're growing fast and looking for talented people.</p>
        </div>

        <div className="space-y-4 mb-10">
          {openings.map((job) => (
            <div key={job.title} className="card p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{job.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{job.desc}</p>
                  <div className="flex flex-wrap gap-3 mt-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{job.type}</span>
                    <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{job.dept}</span>
                  </div>
                </div>
                <a href={`mailto:careers@toloeexpress.com?subject=Application: ${job.title}`} className="btn-primary shrink-0 text-sm">
                  Apply Now
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className="card p-8 text-center">
          <h2 className="font-bold text-gray-900 text-xl mb-2">Don't see a matching role?</h2>
          <p className="text-gray-500 mb-4">We're always looking for talented people. Send us your CV.</p>
          <a href="mailto:careers@toloeexpress.com" className="btn-primary">Send Your CV</a>
        </div>
      </div>
    </div>
  );
}
