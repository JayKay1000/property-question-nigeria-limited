import { useEffect, useState } from 'react';
import { Cpu, Image, FileText, ScanEye, Brain, CheckCircle2, AlertCircle, Loader } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function MediaProcessing() {
  const [thumbnails, setThumbnails] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [ocrData, setOcrData] = useState([]);
  const [aiData, setAiData] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.Thumbnail.list('-created_date', 100).catch(() => []),
      base44.entities.FilePreview.list('-created_date', 100).catch(() => []),
      base44.entities.OCRMetadata.list('-created_date', 100).catch(() => []),
      base44.entities.AIMetadata.list('-created_date', 100).catch(() => []),
      base44.entities.MediaAsset.list('-created_date', 200).catch(() => []),
    ]).then(([t, p, o, a, m]) => { setThumbnails(t); setPreviews(p); setOcrData(o); setAiData(a); setAssets(m); }).finally(() => setLoading(false));
  }, []);

  const processingAssets = assets.filter((a) => ['uploading', 'processing'].includes(a.status));
  const failedAssets = assets.filter((a) => a.status === 'failed');

  const thumbPending = thumbnails.filter((t) => t.generation_status === 'pending' || t.generation_status === 'processing');
  const thumbFailed = thumbnails.filter((t) => t.generation_status === 'failed');
  const thumbComplete = thumbnails.filter((t) => t.generation_status === 'completed');

  const previewPending = previews.filter((p) => p.generation_status === 'pending' || p.generation_status === 'processing');
  const previewComplete = previews.filter((p) => p.generation_status === 'completed');

  const ocrPending = ocrData.filter((o) => ['pending', 'processing'].includes(o.processing_status));
  const ocrComplete = ocrData.filter((o) => o.processing_status === 'completed');
  const ocrFailed = ocrData.filter((o) => o.processing_status === 'failed');

  const aiPending = aiData.filter((a) => ['pending', 'processing'].includes(a.processing_status));
  const aiComplete = aiData.filter((a) => a.processing_status === 'completed');
  const aiFailed = aiData.filter((a) => a.processing_status === 'failed');

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card><CardContent className="p-4"><Loader className="h-5 w-5 text-flame-600" /><p className="mt-2 font-heading text-2xl font-bold">{processingAssets.length}</p><p className="text-xs text-muted-foreground">Assets Processing</p></CardContent></Card>
        <Card><CardContent className="p-4"><Image className="h-5 w-5 text-brand-700" /><p className="mt-2 font-heading text-2xl font-bold">{thumbComplete.length}</p><p className="text-xs text-muted-foreground">Thumbnails Ready</p></CardContent></Card>
        <Card><CardContent className="p-4"><ScanEye className="h-5 w-5 text-info" /><p className="mt-2 font-heading text-2xl font-bold">{ocrComplete.length}</p><p className="text-xs text-muted-foreground">OCR Processed</p></CardContent></Card>
        <Card><CardContent className="p-4"><Brain className="h-5 w-5 text-success" /><p className="mt-2 font-heading text-2xl font-bold">{aiComplete.length}</p><p className="text-xs text-muted-foreground">AI Metadata</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Cpu className="h-4 w-4 text-brand-700" /> Processing Queue</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between"><span className="flex items-center gap-2 text-sm font-medium"><Image className="h-4 w-4 text-brand-700" /> Thumbnail Generation</span></div>
            <div className="mt-2 flex items-center gap-2 text-xs">
              <Badge variant="secondary">{thumbPending.length} pending</Badge>
              <Badge variant="default">{thumbComplete.length} complete</Badge>
              {thumbFailed.length > 0 && <Badge variant="destructive">{thumbFailed.length} failed</Badge>}
            </div>
          </div>
          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between"><span className="flex items-center gap-2 text-sm font-medium"><FileText className="h-4 w-4 text-info" /> Preview Generation</span></div>
            <div className="mt-2 flex items-center gap-2 text-xs">
              <Badge variant="secondary">{previewPending.length} pending</Badge>
              <Badge variant="default">{previewComplete.length} complete</Badge>
            </div>
          </div>
          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between"><span className="flex items-center gap-2 text-sm font-medium"><ScanEye className="h-4 w-4 text-info" /> OCR Processing</span></div>
            <div className="mt-2 flex items-center gap-2 text-xs">
              <Badge variant="secondary">{ocrPending.length} pending</Badge>
              <Badge variant="default">{ocrComplete.length} complete</Badge>
              {ocrFailed.length > 0 && <Badge variant="destructive">{ocrFailed.length} failed</Badge>}
            </div>
          </div>
          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between"><span className="flex items-center gap-2 text-sm font-medium"><Brain className="h-4 w-4 text-success" /> AI Metadata Generation</span></div>
            <div className="mt-2 flex items-center gap-2 text-xs">
              <Badge variant="secondary">{aiPending.length} pending</Badge>
              <Badge variant="default">{aiComplete.length} complete</Badge>
              {aiFailed.length > 0 && <Badge variant="destructive">{aiFailed.length} failed</Badge>}
            </div>
          </div>
        </CardContent>
      </Card>

      {failedAssets.length > 0 && (
        <Card className="border-destructive/30">
          <CardHeader><CardTitle className="flex items-center gap-2 text-sm text-destructive"><AlertCircle className="h-4 w-4" /> Failed Processing</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {failedAssets.slice(0, 10).map((a) => (
              <div key={a.id} className="flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/5 p-2.5">
                <p className="text-sm font-medium">{a.display_name || a.asset_name}</p>
                <Badge variant="destructive" className="text-xs">Failed</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {aiComplete.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Brain className="h-4 w-4 text-success" /> AI Insights</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {aiComplete.slice(0, 8).map((a) => (
              <div key={a.id} className="rounded-lg border p-2.5">
                <div className="flex items-center justify-between">
                  <p className="truncate text-sm font-medium">{a.summary || a.description_ai || 'AI metadata'}</p>
                  {a.quality_score > 0 && <Badge variant="secondary" className="text-xs">Quality: {a.quality_score}%</Badge>}
                </div>
                {a.auto_tags?.length > 0 && <div className="mt-1 flex flex-wrap gap-1">{a.auto_tags.slice(0, 5).map((t, i) => <Badge key={i} variant="outline" className="text-xs">{t}</Badge>)}</div>}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}