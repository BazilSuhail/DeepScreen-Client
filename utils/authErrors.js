// Turn raw auth errors into messages a candidate can act on.
export const getAuthErrorMessage = (err, fallback) => {
  const message = typeof err === "string" ? err : err?.message;
  if (!message) return fallback;

  const normalized = message.toLowerCase();
  if (/(network|failed to fetch|fetch failed|load failed)/.test(normalized)) {
    return "We couldn't reach the server. Check your connection and try again.";
  }
  if (/(401|unauthorized|invalid.*(credential|password|email)|credentials)/.test(normalized)) {
    return "That email or password doesn't match our records.";
  }
  if (/(429|rate limit|too many)/.test(normalized)) {
    return "Too many attempts. Wait a moment, then try again.";
  }
  return message;
};
