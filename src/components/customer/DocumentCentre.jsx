import { Link } from 'react-router-dom';
import { FileText, Download, FolderOpen, ArrowRight, File } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const DOCUMENT_CATEGORIES = [
  { key: 'brochures', label: 'Brochures', icon: 'FileText', desc: 'Property and project brochures' },
  { key: 'reports', label: 'Inspection Reports', icon: 'FileText', desc: 'Your completed inspection reports' },
  { key: 'invoices', label: 'Invoices & Receipts', icon: 'FileText', desc: 'Financial documents' },
  { key: 'contracts', label: 'Contracts', icon: 'FileText', desc: 'Legal agreements' },
  { key: 'correspondence', label: 'Correspondence', icon: 'FileText', desc: 'Official communications' },
  { key: 'marketing', label: 'Marketing Materials', icon: 'FileText', desc: 'Property marketing materials' },
];

export default function DocumentCentre({ documents }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-xl font-bold text-brand-900">Document Centre</h2>
        <Badge variant="secondary" className="bg-ice-100 text-brand-700">{documents.length} documents</Badge>
      </div>

      {/* Category grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {DOCUMENT_CATEGORIES.map((cat) => {
          const count = documents.filter((d) => d.category === cat.key).length;
          return (
            <div key={cat.key} className="rounded-xl border border-brand-100 bg-ice-50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-brand-700"><FileText className="h-5 w-5" /></div>
                <div className="flex-1">
                  <h3 className="font-heading text-sm font-bold text-brand-900">{cat.label}</h3>
                  <p className="text-xs text-muted-foreground">{count} document{count !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{cat.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Documents list */}
      {documents.length > 0 ? (
        <div className="rounded-2xl border border-brand-100 bg-white p-4 shadow-card">
          <h3 className="mb-3 font-heading text-sm font-bold text-brand-900">Available Documents</h3>
          <div className="space-y-2">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center gap-3 rounded-lg border border-brand-100 bg-ice-50 p-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-brand-700"><File className="h-5 w-5" /></div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-brand-900">{doc.title || doc.file_name || 'Document'}</p>
                  <p className="text-xs text-muted-foreground">{doc.category} • {new Date(doc.created_date || doc.uploaded_at).toLocaleDateString('en-NG')}</p>
                </div>
                {doc.file_url && (
                  <a href={doc.file_url} download target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-lg bg-flame-50 px-3 py-1.5 text-xs font-semibold text-flame-600 hover:bg-flame-100">
                    <Download className="h-3.5 w-3.5" /> Download
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-brand-200 bg-white py-16 text-center">
          <FolderOpen className="h-12 w-12 text-brand-200" />
          <h3 className="mt-4 font-heading text-lg font-semibold text-brand-900">No Documents Available</h3>
          <p className="mt-1 text-sm text-muted-foreground">Documents will appear here as they become available to you.</p>
          <Button asChild className="mt-6 bg-flame-500 hover:bg-flame-600">
            <Link to="/support">Request a Document <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      )}
    </div>
  );
}