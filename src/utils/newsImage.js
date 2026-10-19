export const DEFAULT_NEWS_IMAGE = '/services/Oceanographic.jpg';

export function getNewsImageUrl(value) {
  if (!value) return DEFAULT_NEWS_IMAGE;

  try {
    const url = new URL(value);
    if (!url.hostname.endsWith('drive.google.com')) return value;

    const fileMatch = url.pathname.match(/\/file\/d\/([^/]+)/);
    const fileId = fileMatch?.[1] || url.searchParams.get('id');
    return fileId
      ? `https://drive.google.com/thumbnail?id=${encodeURIComponent(fileId)}&sz=w1600`
      : value;
  } catch {
    return value;
  }
}