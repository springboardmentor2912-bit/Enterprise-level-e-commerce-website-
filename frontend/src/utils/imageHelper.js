/**
 * Formats image URLs so they work seamlessly on both Desktop and Mobile devices
 * Converts absolute localhost:8080 URLs to relative /uploads/... URLs handled by Vite proxy
 */
export function formatImageUrl(url) {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (trimmed === '📦' || trimmed.length <= 4) return '';

  const uploadsIndex = trimmed.indexOf('/uploads/');
  if (uploadsIndex !== -1) {
    return trimmed.substring(uploadsIndex);
  }
  if (trimmed.startsWith('uploads/')) {
    return '/' + trimmed;
  }
  return trimmed;
}

