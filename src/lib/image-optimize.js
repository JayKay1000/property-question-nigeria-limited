// Client-side image optimization: resizes and re-encodes photos before upload
// so large phone photos don't crawl up slow connections. The display-time
// `Image` component still does its own responsive/WebP transforms — this
// only shrinks what gets stored and transferred at upload.

const DEFAULT_MAX_DIMENSION = 1920; // longest edge, in px
const DEFAULT_QUALITY = 0.82; // JPEG quality

function loadImageElement(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };
    img.src = url;
  });
}

/**
 * Optimizes an image File in the browser before upload:
 *  - downscales so the longest edge is at most `maxDimension`
 *  - re-encodes JPEGs at `quality` (PNGs with transparency are kept as PNG)
 * Returns the original file unchanged for non-raster/animated formats or on
 * any failure (never blocks the upload).
 */
export async function optimizeImageFile(file, { maxDimension = DEFAULT_MAX_DIMENSION, quality = DEFAULT_QUALITY } = {}) {
  if (!file.type || !file.type.startsWith('image/')) return file;
  // Leave GIFs alone — canvas re-encoding drops animation.
  if (file.type === 'image/gif') return file;

  try {
    const img = await loadImageElement(file);
    let { naturalWidth: width, naturalHeight: height } = img;
    if (!width || !height) return file;

    if (Math.max(width, height) > maxDimension) {
      const scale = maxDimension / Math.max(width, height);
      width = Math.round(width * scale);
      height = Math.round(height * scale);
    }

    const hasAlpha = file.type === 'image/png';
    const outputType = hasAlpha ? 'image/png' : 'image/jpeg';

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;

    // Flatten transparency onto white for JPEG (no ugly black backgrounds).
    if (outputType === 'image/jpeg') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
    }
    ctx.drawImage(img, 0, 0, width, height);

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, outputType, quality));
    if (!blob) return file;

    const ext = hasAlpha ? '.png' : '.jpg';
    const baseName = file.name.replace(/\.[^.]+$/, '');
    const optimizedName = `${baseName}${ext}`;
    return new File([blob], optimizedName, { type: outputType, lastModified: Date.now() });
  } catch {
    // Never block the upload on an optimization error.
    return file;
  }
}