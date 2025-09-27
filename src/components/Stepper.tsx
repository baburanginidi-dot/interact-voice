import { Check, Circle, Mic, CreditCard, FileText, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StepperProps {
  currentStage: string;
}

const steps = [
  {
    id: 'GREETING',
    title: 'Welcome',
    description: 'Initial greeting',
    icon: Mic,
  },
  {
    id: 'PAYMENT_SELECTION',
    title: 'Payment',
    description: 'Choose payment method',
    icon: CreditCard,
  },
  {
    id: 'NBFC_PROCESS',
    title: 'NBFC',
    description: 'Loan processing',
    icon: ShieldCheck,
  },
  {
    id: 'RCA_DOCS',
    title: 'Documents',
    description: 'Document verification',
    icon: FileText,
  },
];

const Stepper = ({ currentStage }: StepperProps) => {
  const getCurrentStepIndex = () => {
    return steps.findIndex(step => step.id === currentStage);
  };

  const currentStepIndex = getCurrentStepIndex();

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      <div className="flex items-center justify-between relative">
        {/* Progress line */}
        <div className="absolute top-6 left-0 w-full h-0.5 bg-muted rounded-full">
          <div 
            className="h-full bg-gradient-primary rounded-full transition-all duration-700 ease-out"
            style={{ 
              width: currentStepIndex >= 0 ? `${((currentStepIndex + 1) / steps.length) * 100}%` : '0%' 
            }}
          />
        </div>

        {steps.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
          const isUpcoming = index > currentStepIndex;
          const IconComponent = step.icon;

          return (
            <div key={step.id} className="flex flex-col items-center relative z-10">
              {/* Step Circle */}
              <div
                className={cn(
                  "w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-500",
                  "shadow-md hover:shadow-lg",
                  {
                    // Completed step
                    "bg-success border-success text-success-foreground shadow-success/20": isCompleted,
                    // Current step
                    "bg-primary border-primary text-primary-foreground shadow-primary/30 scale-110": isCurrent,
                    // Upcoming step
                    "bg-background border-border text-muted-foreground": isUpcoming,
                  }
                )}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : isCurrent ? (
                  <div className="relative">
                    <IconComponent className="w-5 h-5" />
                    <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
                  </div>
                ) : (
                  <Circle className="w-5 h-5" />
                )}
              </div>

              {/* Step Content */}
              <div className="mt-3 text-center min-w-[120px]">
                <h3
                  className={cn(
                    "text-sm font-medium transition-colors duration-300",
                    {
                      "text-success": isCompleted,
                      "text-primary font-semibold": isCurrent,
                      "text-muted-foreground": isUpcoming,
                    }
                  )}
                >
                  {step.title}
                </h3>
                <p
                  className={cn(
                    "text-xs mt-1 transition-colors duration-300",
                    {
                      "text-success/80": isCompleted,
                      "text-primary/80": isCurrent,
                      "text-muted-foreground/60": isUpcoming,
                    }
                  )}
                >
                  {step.description}
                </p>
              </div>

              {/* Step Status Indicator */}
              {isCurrent && (
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Current Step Info */}
      <div className="mt-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          <span className="text-sm font-medium text-primary">
            {currentStepIndex >= 0 && currentStepIndex < steps.length
              ? `Step ${currentStepIndex + 1} of ${steps.length}: ${steps[currentStepIndex].title}`
              : 'Initializing...'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Stepper;