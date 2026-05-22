// Turns a resume list field into an array of clean strings.
// The server stores skills, experience and projects as JSON-encoded strings (for example '["Python","Rust"]'),
// but some responses already send arrays. Plain text falls back to one item per line.
export function parseResumeList(value) {
  if (value == null) return [];
  if (Array.isArray(value)) return value.map(toText).filter(Boolean);

  const text = String(value).trim();
  if (!text) return [];

  if (text.startsWith("[")) {
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) return parsed.map(toText).filter(Boolean);
    } catch {
      // Not valid JSON: fall through to plain-text handling below.
    }
  }

  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

// Object entries (for example { title, company }) become a readable line; strings are trimmed.
function toText(item) {
  if (item == null) return "";
  if (typeof item === "string") return item.trim();
  if (typeof item === "object") {
    return Object.values(item)
      .filter((v) => typeof v === "string" && v.trim())
      .join(" · ");
  }
  return String(item).trim();
}
