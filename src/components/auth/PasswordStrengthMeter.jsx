import { useMemo } from 'react';
import { Check, X } from 'lucide-react';

const checks = [
  { label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { label: 'Uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { label: 'Lowercase letter', test: (p) => /[a-z]/.test(p) },
  { label: 'Number', test: (p) => /[0-9]/.test(p) },
  { label: 'Special character', test: (p) => /[^A-Za-z0-9]/.test(p) },
];

function evaluate(password) {
  const passed = checks.filter((c) => c.test(password)).length;
  const score = Math.round((passed / checks.length) * 100);
  let strength = 'weak', color = 'bg-error';
  if (score >= 100) { strength = 'strong'; color = 'bg-success'; }
  else if (score >= 60) { strength = 'good'; color = 'bg-warning'; }
  else if (score >= 40) { strength = 'fair'; color = 'bg-flame-500'; }
  return { score, strength, color };
}

export default function PasswordStrengthMeter({ password }) {
  const result = useMemo(() => evaluate(password), [password]);
  if (!password) return null;

  return (
    <div className="mt-3 space-y-2.5">
      <div className="flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-brand-100">
          <div
            className={`h-full rounded-full transition-all duration-300 ${result.color}`}
            style={{ width: `${result.score}%` }}
          />
        </div>
        <span className="text-xs font-medium capitalize text-muted-foreground">{result.strength}</span>
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1">
        {checks.map((check) => {
          const passed = check.test(password);
          return (
            <div key={check.label} className={`flex items-center gap-1.5 text-xs ${passed ? 'text-success' : 'text-muted-foreground'}`}>
              {passed ? <Check className="h-3 w-3 shrink-0" /> : <X className="h-3 w-3 shrink-0" />}
              {check.label}
            </div>
          );
        })}
      </div>
    </div>
  );
}