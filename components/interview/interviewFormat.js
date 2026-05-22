
export const humanize = (value) => (typeof value === 'string' ? value.replace(/_/g, ' ') : '');

const parseDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const formatUtcDate = (value) => {
  const date = parseDate(value);
  return date
    ? date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' })
    : null;
};

export const formatUtcDateTime = (value) => {
  const date = parseDate(value);
  if (!date) return null;
  const day = formatUtcDate(value);
  const time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
  return `${day} at ${time} UTC`;
};
