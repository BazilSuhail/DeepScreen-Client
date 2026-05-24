// Shared shape for an AI interview's editable config, used by the create wizard,
// the AI assistant panel and the edit screen. evaluation_criteria is a [{name, weight}]
// list; a legacy {name: weight} object from older rows is converted on read.

const FIELD_LABELS = {
  job: "Job",
  title: "Title",
  description: "Description",
  system_prompt: "Interviewer instructions",
  context_for_ai: "Job context",
  evaluation_criteria: "Scoring criteria",
  questions: "Question pool",
  number_of_questions: "Number of questions",
  duration_minutes: "Time limit",
  passing_score: "Passing score",
  proctoring_policy: "Proctoring thresholds",
};

const MESSAGE_KEYS = ["error", "detail", "message", "interview_id"];

// Prefers the server's field-level message ("Title: ...") over the generic fallback.
export function formatServerError(e, fallback) {
  const errors = e?.errors;
  if (errors && typeof errors === "object" && !Array.isArray(errors)) {
    const fields = Object.entries(errors).filter(([key]) => !MESSAGE_KEYS.includes(key));
    if (fields.length) {
      return fields
        .map(([key, msgs]) => `${FIELD_LABELS[key] ?? key.replace(/_/g, " ")}: ${[msgs].flat().join(" ")}`)
        .join("; ");
    }
  }
  return e?.message || fallback;
}

const asText = (v) => (v == null ? "" : String(v));
const asNumber = (v, fallback) => {
  if (v == null || v === "") return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : v;
};

export function normalizeCriteria(value) {
  const rows = Array.isArray(value)
    ? value.map((c) => [c?.name, c?.weight])
    : Object.entries(value && typeof value === "object" ? value : {});
  return rows.map(([name, weight]) => {
    const n = Number(weight);
    return { name: asText(name), weight: Number.isFinite(n) ? n : 0 };
  });
}

export function normalizeQuestions(value) {
  return (Array.isArray(value) ? value : []).map((q) =>
    typeof q === "string" ? q : asText(q?.text ?? q?.question ?? q?.content),
  );
}

export function toEditableConfig(data) {
  const d = data || {};
  return {
    title: asText(d.title),
    description: asText(d.description),
    system_prompt: asText(d.system_prompt),
    context_for_ai: asText(d.context_for_ai),
    evaluation_criteria: normalizeCriteria(d.evaluation_criteria),
    questions: normalizeQuestions(d.questions),
    number_of_questions: asNumber(d.number_of_questions, 5),
    duration_minutes: asNumber(d.duration_minutes, 20),
    passing_score: asNumber(d.passing_score, 65),
    proctoring_policy: d.proctoring_policy && typeof d.proctoring_policy === "object" ? { ...d.proctoring_policy } : {},
  };
}

// Body for generate/confirm, PATCH and generate/chat. Blank policy keys are dropped so the server defaults apply.
export function toPayload(data) {
  const f = toEditableConfig(data);
  return {
    title: f.title,
    description: f.description,
    system_prompt: f.system_prompt,
    context_for_ai: f.context_for_ai,
    // The server stores criteria as {name: weight}; the editor works on a list.
    evaluation_criteria: Object.fromEntries(f.evaluation_criteria.filter((c) => c.name).map((c) => [c.name, c.weight])),
    questions: f.questions,
    number_of_questions: f.number_of_questions,
    duration_minutes: f.duration_minutes,
    passing_score: f.passing_score,
    proctoring_policy: Object.fromEntries(
      Object.entries(f.proctoring_policy).filter(([, v]) => v !== "" && v != null),
    ),
  };
}
