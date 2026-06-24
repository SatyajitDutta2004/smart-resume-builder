import React from "react";

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Returns an array of React nodes: strings and <mark> elements for matches
export default function highlightReact(text, keywords = []) {
  if (!text) return null;
  if (!keywords || !keywords.length) return escapeHtml(text);

  const escapedKeywords = keywords
    .map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .filter(Boolean);
  if (!escapedKeywords.length) return escapeHtml(text);

  const pattern = new RegExp(`\\b(${escapedKeywords.join("|")})\\b`, "gi");
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = pattern.exec(text)) !== null) {
    const idx = match.index;
    if (idx > lastIndex) {
      parts.push(escapeHtml(text.slice(lastIndex, idx)));
    }
    parts.push(
      React.createElement(
        "mark",
        { key: `${idx}-${match[0]}`, className: "kw" },
        escapeHtml(match[0]),
      ),
    );
    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(escapeHtml(text.slice(lastIndex)));
  }

  return parts;
}
