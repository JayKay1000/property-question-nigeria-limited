import React, { useEffect, useMemo, useRef, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';

/**
 * Rich text editor (ReactQuill) with an image upload button.
 * The image handler uploads the chosen file via Core.UploadFile and inserts
 * the resulting URL into the editor as an <img> embed.
 */
export default function RichTextEditor({ value, onChange, placeholder, minHeight = 280 }) {
  const quillRef = useRef(null);
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const insertImage = async (file) => {
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const editor = quillRef.current?.getEditor();
      if (editor && file_url) {
        const range = editor.getSelection(true) || { index: editor.getLength(), length: 0 };
        editor.insertEmbed(range.index, 'image', file_url);
        editor.setSelection(range.index + 1, 0);
      } else if (!file_url) {
        toast({ title: 'Image upload failed', description: 'No file URL returned.', variant: 'destructive' });
      }
    } catch (e) {
      toast({ title: 'Image upload failed', description: e?.message || 'Could not upload image.', variant: 'destructive' });
    }
    setUploading(false);
  };

  const onFileSelected = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await insertImage(file);
    e.target.value = '';
  };

  // Attach the image handler and paste/drop interception once the editor is
  // ready. Binding via toolbar.addHandler (rather than only the modules config)
  // is the reliable way to override Quill's default image handler.
  useEffect(() => {
    const editor = quillRef.current?.getEditor();
    if (!editor) return;
    const toolbar = editor.getModule('toolbar');
    if (toolbar) {
      toolbar.addHandler('image', () => fileInputRef.current?.click());
    }

    const root = editor.root;
    const onPaste = (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) insertImage(file);
          return;
        }
      }
    };
    const onDrop = (e) => {
      const files = Array.from(e.dataTransfer?.files || []).filter((f) => f.type.startsWith('image/'));
      if (!files.length) return;
      e.preventDefault();
      files.forEach(insertImage);
    };
    root.addEventListener('paste', onPaste);
    root.addEventListener('drop', onDrop);
    return () => {
      root.removeEventListener('paste', onPaste);
      root.removeEventListener('drop', onDrop);
    };
  }, []);

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          [{ color: [] }, { background: [] }],
          ['link', 'image', 'blockquote'],
          ['clean'],
        ],
      },
    }),
    [],
  );

  return (
    <div className="relative">
      <div className="rounded-lg border border-input bg-white">
        <ReactQuill
          ref={quillRef}
          theme="snow"
          value={value || ''}
          onChange={onChange}
          modules={modules}
          placeholder={placeholder}
          style={{ minHeight: `${minHeight}px` }}
        />
      </div>
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onFileSelected} />
      {uploading && (
        <div className="absolute top-2 right-3 rounded bg-brand-900/80 px-2 py-1 text-xs text-white">Uploading image…</div>
      )}
    </div>
  );
}