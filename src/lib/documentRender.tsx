/**
 * Render care export markdown as structured professional document UI.
 * Never dump raw markdown syntax to caregivers.
 */

import type { ReactNode } from "react";

export type DocBlock =
  | { type: "h1" | "h2" | "h3"; text: string }
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "hr" };

export function parseMarkdownToBlocks(md: string): DocBlock[] {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const blocks: DocBlock[] = [];
  let listBuf: string[] = [];

  function flushList() {
    if (listBuf.length) {
      blocks.push({ type: "ul", items: [...listBuf] });
      listBuf = [];
    }
  }

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList();
      continue;
    }
    if (/^---+$/.test(trimmed) || /^\*\*\*+$/.test(trimmed)) {
      flushList();
      blocks.push({ type: "hr" });
      continue;
    }
    const h = /^(#{1,3})\s+(.+)$/.exec(trimmed);
    if (h) {
      flushList();
      const level = h[1]!.length;
      const text = cleanInline(h[2]!);
      blocks.push({
        type: level === 1 ? "h1" : level === 2 ? "h2" : "h3",
        text,
      });
      continue;
    }
    const li = /^[-*+]\s+(.+)$/.exec(trimmed) || /^\d+\.\s+(.+)$/.exec(trimmed);
    if (li) {
      listBuf.push(cleanInline(li[1]!));
      continue;
    }
    flushList();
    blocks.push({ type: "p", text: cleanInline(trimmed) });
  }
  flushList();
  return blocks;
}

function cleanInline(s: string): string {
  return s
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[—–]/g, " - ")
    .trim();
}

export function renderDocumentBlocks(blocks: DocBlock[]): ReactNode {
  return (
    <article className="cr-doc" data-testid="document-rich-body">
      {blocks.map((b, i) => {
        if (b.type === "h1")
          return (
            <h2 key={i} className="cr-doc-h1">
              {b.text}
            </h2>
          );
        if (b.type === "h2")
          return (
            <h3 key={i} className="cr-doc-h2">
              {b.text}
            </h3>
          );
        if (b.type === "h3")
          return (
            <h4 key={i} className="cr-doc-h3">
              {b.text}
            </h4>
          );
        if (b.type === "ul")
          return (
            <ul key={i} className="cr-doc-ul">
              {b.items.map((it, j) => (
                <li key={j}>{it}</li>
              ))}
            </ul>
          );
        if (b.type === "hr") return <hr key={i} className="cr-doc-hr" />;
        return (
          <p key={i} className="cr-doc-p">
            {b.text}
          </p>
        );
      })}
    </article>
  );
}

/** Filter export lines that are pure technical IDs / noise for humans. */
export function sanitizeExportMarkdown(md: string): string {
  return md
    .split("\n")
    .filter((line) => {
      const t = line.trim();
      if (/handoff id|care_recipient_id|person_id|event_id/i.test(t)) return false;
      if (/\b(cr-olivia|p-sadeil|p-maya|p-walter)\b/i.test(t) && t.length < 80)
        return false;
      return true;
    })
    .join("\n");
}
