/**
 * Escapes unsafe HTML characters to prevent XSS when embedding user text in HTML templates.
 */
export function escapeHtml(str: string | null | undefined): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Strips dangerous protocols from URLs (e.g., javascript:, data:) to allow safe linking.
 */
export function sanitizeUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (/^(https?:\/\/)/i.test(trimmed)) {
    return escapeHtml(trimmed);
  }
  return null;
}

