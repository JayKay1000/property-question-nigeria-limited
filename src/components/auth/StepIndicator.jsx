import { Fragment } from 'react';
import { Check } from 'lucide-react';

export default function StepIndicator({ steps, current }) {
  return (
    <div className="mb-8">
      <div className="flex items-center">
        {steps.map((label, i) => (
          <Fragment key={i}>
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-all duration-300 ${
                  i < current
                    ? 'bg-success text-white'
                    : i === current
                    ? 'bg-flame-500 text-white shadow-glow-flame'
                    : 'bg-brand-100 text-muted-foreground'
                }`}
              >
                {i < current ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span className={`text-[10px] font-medium leading-tight text-center max-w-[60px] ${i <= current ? 'text-brand-900' : 'text-muted-foreground'}`}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`mx-1 h-0.5 flex-1 rounded-full transition-all duration-300 ${i < current ? 'bg-success' : 'bg-brand-100'}`} />
            )}
          </Fragment>
        ))}
      </div>
    </div>
  );
}