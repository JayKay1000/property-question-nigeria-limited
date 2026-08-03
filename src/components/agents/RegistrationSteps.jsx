import { Check } from 'lucide-react';
import { REGISTRATION_STEPS } from '@/lib/agent-utils';

export default function RegistrationSteps({ currentStep }) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {REGISTRATION_STEPS.map((step, i) => {
          const isComplete = i < currentStep;
          const isActive = i === currentStep;
          const isLast = i === REGISTRATION_STEPS.length - 1;
          return (
            <div key={step.key} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center">
                <div className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition ${isComplete ? 'border-flame-500 bg-flame-500 text-white' : isActive ? 'border-flame-500 bg-white text-flame-500' : 'border-border bg-white text-muted-foreground'}`}>
                  {isComplete ? <Check className="h-4 w-4" /> : <span className="text-xs font-bold">{i + 1}</span>}
                </div>
                <span className={`mt-1.5 hidden text-center text-[10px] font-medium sm:block ${isActive ? 'text-flame-600' : isComplete ? 'text-brand-900' : 'text-muted-foreground'}`}>{step.label}</span>
              </div>
              {!isLast && (
                <div className="mx-1 h-0.5 flex-1 rounded-full">
                  <div className={`h-full rounded-full transition ${isComplete ? 'bg-flame-500' : 'bg-border'}`} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}