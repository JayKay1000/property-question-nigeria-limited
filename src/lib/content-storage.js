import { base44 } from '@/api/base44Client';

// Entity string fields have a platform-enforced max size. Blog article HTML
// (especially with embedded images) can exceed it, so large content is
// offloaded to an uploaded .html file and the returned URL is stored in the
// field instead. Small content stays inline to keep rendering cheap.

const OFFLOAD_THRESHOLD = 50000; // 50 KB
const OFFLOAD_EXT = '.html';

export function isOffloadedContent(value) {
  return typeof value === 'string' && value.startsWith('http') && value.endsWith(OFFLOAD_EXT);
}

/**
 * Resolves a stored content value back to its HTML for editing or rendering.
 * Inline HTML/Markdown passes through; an offloaded file URL is fetched.
 */
export async function loadContent(value) {
  if (!value) return '';
  if (isOffloadedContent(value)) {
    const res = await fetch(value);
    return await res.text();
  }
  return value;
}

/**
 * Returns a storage-safe value for the content field: the HTML inline when
 * small, or an uploaded file URL when it exceeds the field size limit.
 */
export async function saveContent(html) {
  if (!html || html.length <= OFFLOAD_THRESHOLD) return html;
  const blob = new Blob([html], { type: 'text/html' });
  const file = new File([blob], `blog-content-${Date.now()}.html`, { type: 'text/html' });
  const { file_url } = await base44.integrations.Core.UploadFile({ file });
  return file_url;
}