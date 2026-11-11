export const DEFAULT_NEWS_IMAGE = '/services/fis-news-default.png';
export const NEWS_IMAGE_URLS = [
  'https://drive.google.com/file/d/1ugz3unMLeAaNWmKx18jx72tTTRmrvUKW/view?usp=drive_link',
  'https://drive.google.com/file/d/1PrgyYXCHH6isybAJq9WCOLrojo43CL4O/view?usp=drive_link',
  'https://drive.google.com/file/d/1Z-S8iovyOksK8thnXgdU03OtEWf7v4sr/view?usp=drive_link',
];

const getGoogleDriveFileId = (value) => {
  try {
    const url = new URL(value);
    if (!/(^|\.)drive\.google\.com$|(^|\.)docs\.google\.com$|(^|\.)driveusercontent\.google\.com$/.test(url.hostname)) return null;

    const fileMatch = url.pathname.match(/\/d\/([^/]+)/) || url.pathname.match(/\/file\/d\/([^/]+)/);
    return fileMatch?.[1] || url.searchParams.get('id');
  } catch {
    return null;
  }
};

export function getNewsImageCandidates(value, fallbackIndex) {
  const imageValue = value || NEWS_IMAGE_URLS[fallbackIndex] || null;
  if (!imageValue) return [DEFAULT_NEWS_IMAGE];

  const fileId = getGoogleDriveFileId(imageValue);
  if (!fileId) return [imageValue, DEFAULT_NEWS_IMAGE];

  const encodedId = encodeURIComponent(fileId);
  return [
    `https://drive.google.com/thumbnail?id=${encodedId}&sz=w1600`,
    `https://lh3.googleusercontent.com/d/${encodedId}=w1600`,
    `https://drive.usercontent.google.com/download?id=${encodedId}&export=view`,
    DEFAULT_NEWS_IMAGE,
  ];
}

export function getNewsImageUrl(value, fallbackIndex) {
  return getNewsImageCandidates(value, fallbackIndex)[0];
}

export function handleNewsImageError(event, value, fallbackIndex) {
  const candidates = getNewsImageCandidates(value, fallbackIndex);
  const currentAttempt = Number(event.currentTarget.dataset.newsImageAttempt || 0);
  const nextAttempt = currentAttempt + 1;
  event.currentTarget.dataset.newsImageAttempt = String(nextAttempt);
  if (nextAttempt < candidates.length) {
    event.currentTarget.src = candidates[nextAttempt];
  } else {
    event.currentTarget.onerror = null;
  }
}