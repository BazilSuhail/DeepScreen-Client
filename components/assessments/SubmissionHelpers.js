export function getCandidateInitial(name, email) {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  if (parts.length === 1) return parts[0][0].toUpperCase();
  const address = (email || '').trim();
  return address ? address[0].toUpperCase() : '?';
}

export function hasScore(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

export function scoreTone(percentage) {
  if (!hasScore(percentage)) return { text: 'text-neutral-600 dark:text-neutral-400', hex: '#a3a3a3' };
  if (percentage >= 80) return { text: 'text-emerald-600 dark:text-emerald-400', hex: '#10b981' };
  if (percentage >= 60) return { text: 'text-amber-600 dark:text-amber-400', hex: '#f59e0b' };
  return { text: 'text-red-600 dark:text-red-400', hex: '#ef4444' };
}

export function formatDate(value, options) {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('en-US', options);
}

// Question descriptions are rich text from the backend. Strip active content before rendering.
// shortcut: blocklist sanitizer, not a full HTML parser. Swap for DOMPurify if a dependency is ever allowed.
const BLOCKED_TAGS = new Set(['script', 'style', 'iframe', 'object', 'embed', 'link', 'meta', 'base', 'form', 'input', 'button', 'textarea', 'select']);
const URL_ATTRS = new Set(['href', 'src', 'xlink:href', 'action', 'formaction']);

export function sanitizeHtml(html) {
  if (!html || typeof window === 'undefined') return '';
  const doc = new DOMParser().parseFromString(String(html), 'text/html');
  doc.body.querySelectorAll('*').forEach((el) => {
    if (BLOCKED_TAGS.has(el.tagName.toLowerCase())) {
      el.remove();
      return;
    }
    for (const attr of Array.from(el.attributes)) {
      const name = attr.name.toLowerCase();
      const value = [...attr.value].filter((ch) => ch > '\u001f' && !/\s/.test(ch)).join('').toLowerCase();
      const unsafeUrl = URL_ATTRS.has(name) && /^(javascript|vbscript|data):/.test(value);
      if (name.startsWith('on') || unsafeUrl) el.removeAttribute(attr.name);
    }
  });
  return doc.body.innerHTML;
}
