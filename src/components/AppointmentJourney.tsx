import { AppointmentStatus } from '@/types/appointment';
import { CheckCircle, Clock, User, UserCheck, Stethoscope } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AppointmentJourneyProps {
  currentStatus: AppointmentStatus;
  className?: string;
}

const journeySteps = [
  {
    status: 'scheduled' as AppointmentStatus,
    label: 'Booked',
    icon: CheckCircle,
    description: 'Appointment scheduled',
  },
  {
    status: 'checked-in' as AppointmentStatus,
    label: 'Checked In',
    icon: UserCheck,
    description: 'Patient arrived',
  },
  {
    status: 'waiting' as AppointmentStatus,
    label: 'Waiting',
    icon: Clock,
    description: 'In waiting room',
  },
  {
    status: 'in-progress' as AppointmentStatus,
    label: 'With Doctor',
    icon: Stethoscope,
    description: 'Consultation in progress',
  },
  {
    status: 'completed' as AppointmentStatus,
    label: 'Completed',
    icon: CheckCircle,
    description: 'Appointment finished',
  },
];

export function AppointmentJourney({ currentStatus, className }: AppointmentJourneyProps) {
  const getCurrentStepIndex = () => {
    return journeySteps.findIndex(step => step.status === currentStatus);
  };

  const currentIndex = getCurrentStepIndex();

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between relative">
        {/* Progress line */}
        <div className="absolute top-6 left-6 right-6 h-0.5 bg-border z-0">
          <div 
            className="h-full bg-primary transition-all duration-500 ease-in-out"
            style={{ 
              width: currentIndex >= 0 ? `${(currentIndex / (journeySteps.length - 1)) * 100}%` : '0%'
            }}
          />
        </div>

        {journeySteps.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isUpcoming = index > currentIndex;
          
          const Icon = step.icon;

          return (
            <div key={step.status} className="flex flex-col items-center z-10 bg-background px-2">
              <div
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                  {
                    "bg-success border-success text-success-foreground": isCompleted,
                    "bg-primary border-primary text-primary-foreground animate-pulse": isCurrent,
                    "bg-background border-border text-muted-foreground": isUpcoming,
                  }
                )}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div className="mt-3 text-center">
                <div className={cn(
                  "text-sm font-medium",
                  {
                    "text-success": isCompleted,
                    "text-primary": isCurrent,
                    "text-muted-foreground": isUpcoming,
                  }
                )}>
                  {step.label}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {step.description}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}