import { useState, useRef, useEffect } from 'react';
import { Pen, Type, Upload, Eraser } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';

export default function SignaturePad({ onSigned, signatureUrl, method, onMethodChange }) {
  const [mode, setMode] = useState(method || 'typed');
  const [typedName, setTypedName] = useState('');
  const [uploadedUrl, setUploadedUrl] = useState(signatureUrl || '');
  const [uploading, setUploading] = useState(false);
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    if (mode === 'drawn' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#001A3D';
    }
  }, [mode]);

  const setModeAndNotify = (m) => {
    setMode(m);
    onMethodChange?.(m);
    if (m === 'typed') onSigned?.(null);
    if (m === 'drawn') onSigned?.(null);
    if (m === 'uploaded') onSigned?.(uploadedUrl || null);
  };

  const getCoords = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const startDraw = (e) => {
    e.preventDefault();
    setIsDrawing(true);
    const ctx = canvasRef.current.getContext('2d');
    const { x, y } = getCoords(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const ctx = canvasRef.current.getContext('2d');
    const { x, y } = getCoords(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasDrawn(true);
  };

  const stopDraw = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (hasDrawn) {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      uploadDataUrl(dataUrl, 'signature.png');
    }
  };

  const uploadDataUrl = async (dataUrl, name) => {
    try {
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], name, { type: 'image/png' });
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      onSigned?.(file_url);
    } catch { /* silent */ }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    onSigned?.(null);
  };

  const handleTyped = (value) => {
    setTypedName(value);
    if (value.trim().length >= 3) {
      // Generate a typed signature as canvas text
      const canvas = document.createElement('canvas');
      canvas.width = 400; canvas.height = 120;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#001A3D';
      ctx.font = 'italic 36px "Sora", cursive';
      ctx.textBaseline = 'middle';
      ctx.fillText(value, 20, 60);
      uploadDataUrl(canvas.toDataURL('image/png'), 'typed-signature.png');
    }
  };

  const handleUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setUploadedUrl(file_url);
      onSigned?.(file_url);
    } catch { /* silent */ }
    finally { setUploading(false); }
  };

  return (
    <div>
      <div className="mb-3 flex gap-2">
        <Button type="button" size="sm" variant={mode === 'typed' ? 'default' : 'outline'} onClick={() => setModeAndNotify('typed')} className={mode === 'typed' ? 'bg-flame-500 hover:bg-flame-600' : 'border-brand-200'}>
          <Type className="mr-1.5 h-4 w-4" /> Type
        </Button>
        <Button type="button" size="sm" variant={mode === 'drawn' ? 'default' : 'outline'} onClick={() => setModeAndNotify('drawn')} className={mode === 'drawn' ? 'bg-flame-500 hover:bg-flame-600' : 'border-brand-200'}>
          <Pen className="mr-1.5 h-4 w-4" /> Draw
        </Button>
        <Button type="button" size="sm" variant={mode === 'uploaded' ? 'default' : 'outline'} onClick={() => setModeAndNotify('uploaded')} className={mode === 'uploaded' ? 'bg-flame-500 hover:bg-flame-600' : 'border-brand-200'}>
          <Upload className="mr-1.5 h-4 w-4" /> Upload
        </Button>
      </div>

      {mode === 'typed' && (
        <div className="rounded-xl border border-brand-200 bg-ice-50 p-4">
          <Input value={typedName} onChange={(e) => handleTyped(e.target.value)} placeholder="Type your full name to sign..."
            className="bg-white font-heading text-lg italic text-brand-900" />
          {typedName && (
            <p className="mt-3 border-b-2 border-brand-900 pb-2 font-heading text-2xl italic text-brand-900" style={{ fontFamily: 'Sora, cursive' }}>{typedName}</p>
          )}
        </div>
      )}

      {mode === 'drawn' && (
        <div className="rounded-xl border border-brand-200 bg-ice-50 p-3">
          <canvas ref={canvasRef} width={400} height={160}
            onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
            onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw}
            className="w-full cursor-crosshair rounded-lg bg-white touch-none" />
          <div className="mt-2 flex justify-end">
            <Button type="button" size="sm" variant="ghost" onClick={clearCanvas}><Eraser className="mr-1.5 h-3.5 w-3.5" /> Clear</Button>
          </div>
        </div>
      )}

      {mode === 'uploaded' && (
        <div className="rounded-xl border-2 border-dashed border-brand-200 bg-ice-50 p-5 text-center">
          {uploadedUrl ? (
            <div className="flex items-center justify-center">
              <img src={uploadedUrl} alt="Signature" className="max-h-32 object-contain" />
            </div>
          ) : (
            <label className="cursor-pointer">
              <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">{uploading ? 'Uploading...' : 'Click to upload signature image'}</p>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload(e.target.files?.[0])} />
            </label>
          )}
        </div>
      )}
    </div>
  );
}