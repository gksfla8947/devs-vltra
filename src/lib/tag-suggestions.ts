export const MAX_TAG_TEXT = 24_000;

export function tagKey(tag: string): string {
  return tag.normalize("NFKC").trim().toLowerCase();
}

// Only traverse textual BlockNote content, never file URLs, IDs or base64 data.
export function extractTagText(blocks: unknown): string {
  const parts: string[] = [];
  let length = 0;
  function walk(value: unknown, depth = 0) {
    if (depth > 40 || length >= MAX_TAG_TEXT || !value) return;
    if (typeof value === "string") {
      const text = value.slice(0, MAX_TAG_TEXT - length);
      parts.push(text);
      length += text.length + 1;
    } else if (Array.isArray(value)) {
      for (const item of value) walk(item, depth + 1);
    } else if (typeof value === "object") {
      const node = value as Record<string, unknown>;
      if (typeof node.text === "string") walk(node.text, depth + 1);
      for (const key of ["content", "children", "rows", "cells"]) {
        walk(node[key], depth + 1);
      }
    }
  }
  walk(blocks);
  return parts.join(" ").trim().slice(0, MAX_TAG_TEXT);
}

export function normalizeSuggestions(value: unknown, existing: string[], selected: string[]): string[] {
  if (!Array.isArray(value) || value.some((tag) => typeof tag !== "string")) {
    throw new Error("Invalid tag response");
  }
  const canonical = new Map(existing.map((tag) => [tagKey(tag), tag]));
  const seen = new Set(selected.map(tagKey));
  const result: string[] = [];
  for (const raw of value as string[]) {
    const cleaned = raw.trim().replace(/^#+/, "").trim();
    if (!cleaned || cleaned.length > 40 || /[\r\n<>]/.test(cleaned)) continue;
    const key = tagKey(cleaned);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(canonical.get(key) ?? cleaned);
    if (result.length === 7) break;
  }
  return result;
}
