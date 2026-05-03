import { CheckCircle, Circle, Clock, Package, Truck, MapPin, AlertCircle } from 'lucide-react';
import { cn, formatDateTime, STATUS_LABELS } from '@/lib/utils';

const STATUS_STEPS = [
  'PENDING', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED',
];

const STATUS_ICONS: Record<string, React.ElementType> = {
  PENDING: Clock,
  PICKED_UP: Package,
  IN_TRANSIT: Truck,
  OUT_FOR_DELIVERY: MapPin,
  DELIVERED: CheckCircle,
  CANCELLED: AlertCircle,
  RETURNED: AlertCircle,
};

interface TrackingEvent {
  id: string;
  status: string;
  location: string | null;
  notes: string | null;
  timestamp: string;
}

interface Props {
  events: TrackingEvent[];
  currentStatus: string;
}

export default function TrackingTimeline({ events, currentStatus }: Props) {
  const currentStep = STATUS_STEPS.indexOf(currentStatus);

  return (
    <div className="space-y-6">
      {/* Progress steps */}
      <div className="hidden sm:flex items-center justify-between mb-8">
        {STATUS_STEPS.map((step, i) => {
          const isCompleted = i <= currentStep;
          const isCurrent = i === currentStep;
          const Icon = STATUS_ICONS[step] || Circle;

          return (
            <div key={step} className="flex-1 flex items-center">
              <div className="flex flex-col items-center flex-1">
                <div className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all',
                  isCompleted
                    ? 'bg-brand-700 border-brand-700 text-white'
                    : 'bg-white border-gray-300 text-gray-400'
                )}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={cn(
                  'text-xs mt-2 text-center font-medium',
                  isCurrent ? 'text-brand-700' : isCompleted ? 'text-gray-700' : 'text-gray-400'
                )}>
                  {STATUS_LABELS[step] || step}
                </span>
              </div>
              {i < STATUS_STEPS.length - 1 && (
                <div className={cn('h-0.5 flex-1 mx-1 transition-all', i < currentStep ? 'bg-brand-700' : 'bg-gray-200')} />
              )}
            </div>
          );
        })}
      </div>

      {/* Event log */}
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900">Tracking History</h3>
        {events.length === 0 ? (
          <p className="text-gray-500 text-sm">No tracking events yet.</p>
        ) : (
          <ol className="relative border-l border-gray-200">
            {[...events].reverse().map((event, i) => {
              const Icon = STATUS_ICONS[event.status] || Circle;
              const isFirst = i === 0;
              return (
                <li key={event.id} className="mb-6 ml-6">
                  <span className={cn(
                    'absolute -left-3 flex items-center justify-center w-6 h-6 rounded-full ring-4 ring-white',
                    isFirst ? 'bg-brand-700' : 'bg-gray-200'
                  )}>
                    <Icon className={cn('w-3 h-3', isFirst ? 'text-white' : 'text-gray-500')} />
                  </span>
                  <p className={cn('font-semibold text-sm', isFirst ? 'text-brand-700' : 'text-gray-900')}>
                    {STATUS_LABELS[event.status] || event.status}
                  </p>
                  {event.location && (
                    <p className="text-xs text-gray-500">{event.location}</p>
                  )}
                  {event.notes && (
                    <p className="text-sm text-gray-600 mt-0.5">{event.notes}</p>
                  )}
                  <time className="text-xs text-gray-400">{formatDateTime(event.timestamp)}</time>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </div>
  );
}
