export function buildLimitedComment(
  parts: Array<string | null | undefined>,
  limit: number,
) {
  const cleaned = parts
    .map((text) => (text ?? "").trim())
    .filter((text) => text.length > 0);
  if (cleaned.length === 0) return "";
  let combined = "";
  for (const text of cleaned) {
    const next = combined ? `${combined}\n${text}` : text;
    if (next.length > limit) {
      return combined || text;
    }
    combined = next;
  }
  return combined;
}

export function buildCommentPreview(
  parts: Array<string | null | undefined>,
  limit = 120,
  alwaysEllipsis = false,
) {
  const cleaned = parts
    .map((text) => (text ?? "").trim())
    .filter((text) => text.length > 0);
  if (cleaned.length === 0) return { text: "", hasMore: false };
  let combined = "";
  let truncated = false;
  for (const text of cleaned) {
    const separator = combined ? "\n" : "";
    const next = `${combined}${separator}${text}`;
    if (next.length > limit) {
      const remaining = limit - combined.length - separator.length;
      if (remaining > 0) {
        combined = `${combined}${separator}${text.slice(0, remaining)}`;
      }
      truncated = true;
      break;
    }
    combined = next;
  }
  return {
    text: combined,
    hasMore: truncated || (alwaysEllipsis && combined.length > 0),
  };
}
