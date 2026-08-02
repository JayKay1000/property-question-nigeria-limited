import Reveal from './Reveal';

export default function SectionHeader({ eyebrow, title, description, align = 'center', className = '' }) {
  const alignment = align === 'center' ? 'text-center mx-auto' : 'text-left';
  return (
    <Reveal className={`max-w-2xl ${alignment} ${className}`}>
      {eyebrow && (
        <span className="inline-flex items-center gap-2 rounded-full bg-flame-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-flame-600">
          <span className="h-1.5 w-1.5 rounded-full bg-flame-500" />
          {eyebrow}
        </span>
      )}
      <h2 className="mt-4 font-heading text-3xl font-bold tracking-tight text-brand-900 sm:text-4xl lg:text-[2.75rem]">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
          {description}
        </p>
      )}
    </Reveal>
  );
}