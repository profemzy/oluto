"use client";

import { memo } from "react";

interface MarkdownRendererProps {
  content: string;
  variant?: "user" | "assistant";
}

function CodeBlock({ content, lang }: { content: string; lang?: string }) {
  const handleCopy = () => {
    navigator.clipboard.writeText(content);
  };

  return (
    <div className="relative group my-3 rounded-lg overflow-hidden border border-edge-subtle">
      <div className="flex items-center justify-between px-3 py-1.5 bg-surface-tertiary text-xs">
        <span className="text-muted font-mono">{lang || "text"}</span>
        <button
          onClick={handleCopy}
          className="text-muted hover:text-heading transition-colors opacity-0 group-hover:opacity-100"
        >
          Copy
        </button>
      </div>
      <pre className="p-3 overflow-x-auto bg-surface-secondary text-sm">
        <code>{content}</code>
      </pre>
    </div>
  );
}

function renderMarkdown(content: string, variant: "user" | "assistant"): React.ReactNode[] {
  const lines = content.split("\n");
  const result: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Fenced code blocks
    if (line.startsWith("```")) {
      const lang = line.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      result.push(<CodeBlock key={key++} content={codeLines.join("\n")} lang={lang} />);
      continue;
    }

    // Headers
    if (line.startsWith("### ")) {
      result.push(<h3 key={key++} className="text-base font-bold mt-4 mb-2">{line.slice(4)}</h3>);
      i++;
      continue;
    }
    if (line.startsWith("## ")) {
      result.push(<h2 key={key++} className="text-lg font-bold mt-4 mb-2">{line.slice(3)}</h2>);
      i++;
      continue;
    }
    if (line.startsWith("# ")) {
      result.push(<h1 key={key++} className="text-xl font-bold mt-4 mb-2">{line.slice(2)}</h1>);
      i++;
      continue;
    }

    // Horizontal rule
    if (/^---+$/.test(line.trim())) {
      result.push(<hr key={key++} className="my-4 border-edge-subtle" />);
      i++;
      continue;
    }

    // Blockquote
    if (line.startsWith("> ")) {
      result.push(
        <blockquote key={key++} className="border-l-4 border-cyan-400 pl-3 my-2 text-muted italic">
          {formatInline(line.slice(2))}
        </blockquote>
      );
      i++;
      continue;
    }

    // Unordered list
    if (/^\s*[-*] /.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*] /.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*] /, ""));
        i++;
      }
      result.push(
        <ul key={key++} className="list-disc list-inside my-2 space-y-1">
          {items.map((item, j) => <li key={j}>{formatInline(item)}</li>)}
        </ul>
      );
      continue;
    }

    // Ordered list
    if (/^\s*\d+\. /.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+\. /.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+\. /, ""));
        i++;
      }
      result.push(
        <ol key={key++} className="list-decimal list-inside my-2 space-y-1">
          {items.map((item, j) => <li key={j}>{formatInline(item)}</li>)}
        </ol>
      );
      continue;
    }

    // Table
    if (line.includes("|") && i + 1 < lines.length && /^\|?[\s-:|]+\|?$/.test(lines[i + 1])) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].includes("|")) {
        tableLines.push(lines[i]);
        i++;
      }
      const rows = tableLines.filter((l) => !/^[\s|:\-]+$/.test(l));
      const parseCells = (row: string) =>
        row.split("|").filter((c, idx, arr) => idx > 0 && idx < arr.length - 1 || (arr.length <= 2 && c.trim())).map(c => c.trim());
      result.push(
        <div key={key++} className="overflow-x-auto my-3">
          <table className="min-w-full text-sm border border-edge-subtle rounded-lg overflow-hidden">
            <thead className="bg-surface-secondary">
              <tr>
                {parseCells(rows[0]).map((cell, j) => (
                  <th key={j} className="px-3 py-2 text-left font-bold text-heading border-b border-edge-subtle">{cell}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.slice(1).map((row, ri) => (
                <tr key={ri} className="border-b border-edge-subtle">
                  {parseCells(row).map((cell, j) => (
                    <td key={j} className="px-3 py-2 text-body">{formatInline(cell)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    // Empty line
    if (!line.trim()) {
      i++;
      continue;
    }

    // Regular paragraph
    result.push(<p key={key++} className="my-1.5 leading-relaxed">{formatInline(line)}</p>);
    i++;
  }

  return result;
}

function formatInline(text: string): React.ReactNode {
  // Bold + italic
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`|\[(.+?)\]\((.+?)\))/g;
  let lastIndex = 0;
  let match;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    if (match[2]) {
      parts.push(<strong key={key++} className="font-bold italic">{match[2]}</strong>);
    } else if (match[3]) {
      parts.push(<strong key={key++} className="font-bold">{match[3]}</strong>);
    } else if (match[4]) {
      parts.push(<em key={key++}>{match[4]}</em>);
    } else if (match[5]) {
      parts.push(<code key={key++} className="px-1.5 py-0.5 rounded bg-surface-tertiary font-mono text-sm">{match[5]}</code>);
    } else if (match[6] && match[7]) {
      parts.push(
        <a key={key++} href={match[7]} target="_blank" rel="noopener noreferrer" className="text-cyan-600 hover:underline">
          {match[6]}
        </a>
      );
    }
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length === 1 ? parts[0] : <>{parts}</>;
}

export const MarkdownRenderer = memo(function MarkdownRenderer({ content, variant = "assistant" }: MarkdownRendererProps) {
  return (
    <div className={`markdown-content ${variant === "user" ? "text-white" : "text-heading"}`}>
      {renderMarkdown(content, variant)}
    </div>
  );
});
