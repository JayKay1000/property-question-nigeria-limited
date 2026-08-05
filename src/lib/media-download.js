export const isImage = (url = '') => /\.(jpe?g|png|webp|gif|bmp|svg|avif)(\?|$)/i.test(url);
export const isVideo = (url = '') => /\.(mp4|webm|mov|avi|mkv|m4v|ogg|ogv)(\?|$)/i.test(url);
export const isPdf = (url = '') => /\.pdf(\?|$)/i.test(url);

export function fileNameFromUrl(url = '') {
  const clean = (url || '').split('?')[0];
  return decodeURIComponent(clean.split('/').pop() || 'file');
}

export async function downloadFile(url, filename) {
  try {
    const res = await fetch(url, { mode: 'cors' });
    if (!res.ok) throw new Error('fetch failed');
    const blob = await res.blob();
    const objUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = objUrl;
    a.download = filename || fileNameFromUrl(url);
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(objUrl), 5000);
  } catch (e) {
    window.open(url, '_blank');
  }
}

export async function downloadAll(urls, baseName) {
  for (let i = 0; i < urls.length; i++) {
    const u = urls[i];
    const ext = (u.split('.').pop() || 'file').split('?')[0];
    await downloadFile(u, `${baseName}-${i + 1}.${ext}`);
    await new Promise((r) => setTimeout(r, 350));
  }
}