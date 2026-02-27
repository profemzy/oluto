"use client";

import { memo, useState } from "react";

interface MarkdownRendererProps {
  content: string;
  variant?: "user" | "assistant";
}

function CopyableCodeBlock({ content, lang }: { content: string; lang?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-3 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-gray-800 text-xs">
        <span className="text-gray-500 dark:text-gray-400 font-mono">{lang || "text"}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors opacity-0 group-hover:opacity-100"
        >
          {copied ? (
            <>
              <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-emerald-500">Copied</span>
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto bg-gray-50 dark:bg-gray-900 text-sm">
        <code className="font-mono text-gray-700 dark:text-gray-200">{content}</code>
      </pre>
    </div>
  );
}

function UserCodeBlock({ content }: { content: string }) {
  return (
    <pre className="bg-white/20 rounded-lg p-3 my-2 overflow-x-auto">
      <code className="text-sm text-white/90 font-mono">{content}</code>
    </pre>
  );
}

function formatInline(text: string, variant: "user" | "assistant"): React.ReactNode {
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
      // Bold + italic
      parts.push(
        <strong key={key++} className={`font-bold italic ${variant === "user" ? "text-white" : "text-gray-900 dark:text-white"}`}>
          {match[2]}
        </strong>
      );
    } else if (match[3]) {
      // Bold
      parts.push(
        <strong key={key++} className={`font-bold ${variant === "user" ? "text-white" : "text-gray-900 dark:text-white"}`}>
          {match[3]}
        </strong>
      );
    } else if (match[4]) {
      // Italic
      parts.push(
        <em key={key++} className={variant === "user" ? "text-white/90" : undefined}>
          {match[4]}
        </em>
      );
    } else if (match[5]) {
      // Inline code
      if (variant === "user") {
        parts.push(
          <code key={key++} className="bg-white/20 px-1.5 py-0.5 rounded text-sm text-white font-mono">
            {match[5]}
          </code>
        );
      } else {
        parts.push(
          <code key={key++} className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono text-gray-900 dark:text-white">
            {match[5]}
          </code>
        );
      }
    } else if (match[6] && match[7]) {
      // Link
      parts.push(
        <a
          key={key++}
          href={match[7]}
          target="_blank"
          rel="noopener noreferrer"
          className={variant === "user"
            ? "text-white underline decoration-white/50 hover:decoration-white"
            : "text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 underline"
          }
        >
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

function renderUserMarkdown(content: string): React.ReactNode[] {
  const lines = content.split("\n");
  const result: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Fenced code blocks
    if (line.startsWith("```")) {
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      i++;
      result.push(<UserCodeBlock key={key++} content={codeLines.join("\n")} />);
      continue;
    }

    // Headings
    if (line.startsWith("### ")) {
      result.push(<h3 key={key++} className="text-sm font-semibold my-2 text-white/95">{formatInline(line.slice(4), "user")}</h3>);
      i++; continue;
    }
    if (line.startsWith("## ")) {
      result.push(<h2 key={key++} className="text-base font-bold my-2 text-white">{formatInline(line.slice(3), "user")}</h2>);
      i++; continue;
    }
    if (line.startsWith("# ")) {
      result.push(<h1 key={key++} className="text-lg font-bold my-3 text-white border-b border-white/20 pb-1">{formatInline(line.slice(2), "user")}</h1>);
      i++; continue;
    }

    // Horizontal rule
    if (/^---+$/.test(line.trim())) {
      result.push(<hr key={key++} className="border-white/20 my-3" />);
      i++; continue;
    }

    // Blockquote
    if (line.startsWith("> ")) {
      result.push(
        <blockquote key={key++} className="border-l-4 border-white/30 pl-3 my-2 text-white/80 italic">
          {formatInline(line.slice(2), "user")}
        </blockquote>
      );
      i++; continue;
    }

    // Unordered list
    if (/^\s*[-*] /.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*] /.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*] /, ""));
        i++;
      }
      result.push(
        <ul key={key++} className="my-2 space-y-1.5">
          {items.map((item, j) => (
            <li key={j} className="flex items-start gap-2">
              <span className="text-white/70 mt-1.5 text-xs">&#x2022;</span>
              <span className="text-white/90">{formatInline(item, "user")}</span>
            </li>
          ))}
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
        <ol key={key++} className="my-2 space-y-1.5 list-decimal list-inside text-white/90">
          {items.map((item, j) => <li key={j} className="leading-relaxed">{formatInline(item, "user")}</li>)}
        </ol>
      );
      continue;
    }

    // Empty line
    if (!line.trim()) { i++; continue; }

    // Regular paragraph
    result.push(<p key={key++} className="my-2 leading-relaxed text-white/95">{formatInline(line, "user")}</p>);
    i++;
  }

  return result;
}

function renderAssistantMarkdown(content: string): React.ReactNode[] {
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
      i++;
      result.push(<CopyableCodeBlock key={key++} content={codeLines.join("\n")} lang={lang} />);
      continue;
    }

    // Headings
    if (line.startsWith("### ")) {
      result.push(
        <h3 key={key++} className="text-base font-semibold my-2 text-gray-900 dark:text-white">
          {formatInline(line.slice(4), "assistant")}
        </h3>
      );
      i++; continue;
    }
    if (line.startsWith("## ")) {
      result.push(
        <h2 key={key++} className="text-lg font-bold my-3 text-gray-900 dark:text-white">
          {formatInline(line.slice(3), "assistant")}
        </h2>
      );
      i++; continue;
    }
    if (line.startsWith("# ")) {
      result.push(
        <h1 key={key++} className="text-xl font-bold my-4 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
          {formatInline(line.slice(2), "assistant")}
        </h1>
      );
      i++; continue;
    }

    // Horizontal rule
    if (/^---+$/.test(line.trim())) {
      result.push(<hr key={key++} className="border-gray-200 dark:border-gray-700 my-4" />);
      i++; continue;
    }

    // Blockquote
    if (line.startsWith("> ")) {
      result.push(
        <blockquote key={key++} className="border-l-4 border-cyan-400 dark:border-cyan-600 pl-4 my-3 italic text-gray-500 dark:text-gray-400">
          {formatInline(line.slice(2), "assistant")}
        </blockquote>
      );
      i++; continue;
    }

    // Unordered list
    if (/^\s*[-*] /.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*] /.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*] /, ""));
        i++;
      }
      result.push(
        <ul key={key++} className="my-3 space-y-2">
          {items.map((item, j) => (
            <li key={j} className="flex items-start gap-3">
              <span className="text-gray-400 dark:text-gray-500 mt-1.5 text-xs">&#x25CF;</span>
              <span className="text-gray-700 dark:text-gray-200 leading-relaxed">{formatInline(item, "assistant")}</span>
            </li>
          ))}
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
        <ol key={key++} className="my-3 space-y-2 list-decimal list-inside text-gray-700 dark:text-gray-200">
          {items.map((item, j) => <li key={j} className="leading-relaxed">{formatInline(item, "assistant")}</li>)}
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
        <div key={key++} className="overflow-x-auto my-4">
          <table className="min-w-full border-collapse border border-gray-200 dark:border-gray-700 text-sm rounded-lg overflow-hidden">
            <thead>
              <tr>
                {parseCells(rows[0]).map((cell, j) => (
                  <th key={j} className="border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 px-4 py-2 text-left font-semibold text-gray-900 dark:text-white">
                    {formatInline(cell, "assistant")}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.slice(1).map((row, ri) => (
                <tr key={ri}>
                  {parseCells(row).map((cell, j) => (
                    <td key={j} className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-gray-700 dark:text-gray-200">
                      {formatInline(cell, "assistant")}
                    </td>
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
    if (!line.trim()) { i++; continue; }

    // Regular paragraph
    result.push(
      <p key={key++} className="my-3 leading-relaxed text-gray-700 dark:text-gray-200">
        {formatInline(line, "assistant")}
      </p>
    );
    i++;
  }

  return result;
}

export const MarkdownRenderer = memo(function MarkdownRenderer({ content, variant = "assistant" }: MarkdownRendererProps) {
  return (
    <div className="markdown-content">
      {variant === "user" ? renderUserMarkdown(content) : renderAssistantMarkdown(content)}
    </div>
  );
});
