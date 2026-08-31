import React, { useEffect, useMemo, useRef, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { base44 } from '@/api/base44Client';

/**
 * Rich text editor (ReactQuill) with an image upload button.
 * The image handler uploads the chosen file via Core.UploadFile and inserts
 * the resulting URL into the editor as an <img> embed.
 */
export default function RichTextEditor({ value, onChange, placeholder, minHeight = 280 }) {
  const quillRef = useRef(null);
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleImage = () => {
    fileInputRef.current?.click();
  };

  const onFileSelected = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await insertImage(file);
    e.target.value = '';
  };

  // Uploads an image file and inserts the resulting URL (never a base64 data
  // URI, which would bloat the stored content past the record size limit).
  const insertImage = async (file) => {
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const editor = quillRef.current?.getEditor();
      if (editor) {
        const range = editor.getSelection(true) || { index: editor.getLength(), length: 0 };
        editor.insertEmbed(range.index, 'image', file_url);
        editor.setSelection(range.index + 1, 0);
      }
    } catch { /* ignore */ }
    setUploading(false);
  };

  // Intercept pasted/dragged images so they upload to storage instead of being
  // embedded inline as base64 (which exceeds the entity record size limit).
  useEffect(() => {
    const editor = quillRef.current?.getEditor();
    if (!editor) return;
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
        handlers: { image: handleImage },
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