export const DEFAULT_NEWS_IMAGE = '/services/Oceanographic.jpg';
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function getGoogleDriveDetails(value) {
  try {
    const url = new URL(value);
    const pathMatch = url.pathname.match(/\/(?:file\/d|d)\/([^/]+)/);
    const fileId = pathMatch?.[1] || url.searchParams.get('id') || null;
    const resourceKey = url.searchParams.get('resourcekey');
    return fileId ? { fileId, resourceKey } : null;
  } catch {
    return null;
  }
}

export function getNewsImageUrls(value) {
  if (!value) return [DEFAULT_NEWS_IMAGE];

  try {
    const url = new URL(value);
    const isGoogleDriveUrl = url.hostname === 'drive.google.com'
      || url.hostname === 'drive.usercontent.google.com'
      || url.hostname === 'docs.google.com'
      || url.hostname === 'googleusercontent.com'
      || url.hostname.endsWith('.googleusercontent.com');

    if (!isGoogleDriveUrl) return [value, DEFAULT_NEWS_IMAGE];

    const details = getGoogleDriveDetails(value);
    if (!details) return [value, DEFAULT_NEWS_IMAGE];

    const encodedId = encodeURIComponent(details.fileId);
    const resourceKey = details.resourceKey
      ? `&resourcekey=${encodeURIComponent(details.resourceKey)}`
      : '';
    return [
      `${apiUrl}/api/news-image/${encodedId}${resourceKey}`,
      `https://drive.google.com/thumbnail?id=${encodedId}&sz=w1600${resourceKey}`,
      `https://drive.google.com/uc?export=view&id=${encodedId}${resourceKey}`,
      `https://drive.usercontent.google.com/download?id=${encodedId}&export=view${resourceKey}`,
      DEFAULT_NEWS_IMAGE,
    ];
  } catch {
    return [DEFAULT_NEWS_IMAGE];
  }
}

export function getNewsImageUrl(value) {
  return getNewsImageUrls(value)[0];
}