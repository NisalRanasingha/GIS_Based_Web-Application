export const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export async function apiFetch(path, options = {}) {
  const token = window.sessionStorage.getItem('fis_token');
  const headers = new Headers(options.headers || {});
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  const response = await fetch(`${apiUrl}${path}`, { ...options, headers });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = result.message || `${response.status} ${response.statusText}`;
    throw new Error(`Request failed for ${path}: ${detail}`);
  }
  return result;
}
