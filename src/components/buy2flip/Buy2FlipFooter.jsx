import { ExternalLink } from 'lucide-react';

export default function Buy2FlipFooter({ onVisit }) {
  return (
    <section className="border-t border-border bg-white py-8 section-pad">
      <div className="container-wide flex flex-col items-center justify-between gap-4 sm:flex-row">
        <p className="text-sm text-muted-foreground">
          Buy2Flip is a subsidiary of Property Question Nigeria Limited.
        </p>
        <button
          onClick={onVisit}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-flame-600 transition-colors hover:text-flame-700 hover:underline"
        >
          Visit Buy2Flip Official Website
          <ExternalLink className="h-3.5 w-3.5" />
        </button>
      </div>
    </section>
  );
}