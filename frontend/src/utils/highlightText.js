function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function highlightText(text, query) {
  const safeText = escapeHtml(text || "");
  const trimmedQuery = (query || "").trim();

  if (!trimmedQuery) {
    return safeText;
  }

  const pattern = new RegExp(`(${escapeRegex(trimmedQuery)})`, "gi");
  return safeText.replace(pattern, "<mark>$1</mark>");
}
