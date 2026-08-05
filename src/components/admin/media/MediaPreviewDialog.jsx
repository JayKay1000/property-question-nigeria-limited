import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, ExternalLink } from 'lucide-react';
import { downloadFile, fileNameFromUrl, isImage, isVideo, isPdf } from '@/lib/media-download';

export default function MediaPreviewDialog({ media, onClose }) {
  const open = !!media;
  const url = media?.url || '';
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="truncate">{media?.name || 'Media preview'}</DialogTitle>
          <DialogDescription className="truncate text-xs">{url}</DialogDescription>
        </DialogHeader>
        <div className="flex max-h-[60vh] items-center justify-center overflow-auto rounded-lg border bg-muted/40 p-3">
          {url && isImage(url) && <img src={url} alt={media?.name} className="max-h-[55vh] w-auto rounded" />}
          {url && isVideo(url) && <video src={url} controls className="max-h-[55vh] w-full rounded" />}
          {url && isPdf(url) && <iframe src={url} title="preview" className="h-[55vh] w-full rounded" />}
          {url && !isImage(url) && !isVideo(url) && !isPdf(url) && (
            <div className="p-10 text-center text-sm text-muted-foreground">No inline preview available. Use Download to view.</div>
          )}
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" asChild>
            <a href={url} target="_blank" rel="noreferrer"><ExternalLink className="mr-1 h-4 w-4" /> Open</a>
          </Button>
          <Button onClick={() => downloadFile(url, fileNameFromUrl(url))}>
            <Download className="mr-1 h-4 w-4" /> Download
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}