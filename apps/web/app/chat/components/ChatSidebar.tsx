"use client";

import { useState } from "react";
import { Conversation } from "@/app/lib/api";

interface ChatSidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
  collapsed: boolean;
  onToggle: () => void;
}

function groupByDate(conversations: Conversation[]): { label: string; items: Conversation[] }[] {
  const now = new Date();
  const today = now.toDateString();
  const yesterday = new Date(now.getTime() - 86400000).toDateString();
  const weekAgo = new Date(now.getTime() - 7 * 86400000);

  const groups: Record<string, Conversation[]> = {
    Today: [],
    Yesterday: [],
    "Last 7 Days": [],
    Older: [],
  };

  for (const c of conversations) {
    const d = new Date(c.updated_at);
    if (d.toDateString() === today) groups.Today.push(c);
    else if (d.toDateString() === yesterday) groups.Yesterday.push(c);
    else if (d > weekAgo) groups["Last 7 Days"].push(c);
    else groups.Older.push(c);
  }

  return Object.entries(groups)
    .filter(([, items]) => items.length > 0)
    .map(([label, items]) => ({ label, items }));
}

export function ChatSidebar({
  conversations,
  activeId,
  onSelect,
  onNew,
  onRename,
  onDelete,
  collapsed,
  onToggle,
}: ChatSidebarProps) {
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filtered = search
    ? conversations.filter((c) => c.title.toLowerCase().includes(search.toLowerCase()))
    : conversations;

  const groups = groupByDate(filtered);

  if (collapsed) {
    return (
      <div className="w-12 border-r border-edge-subtle bg-surface flex flex-col items-center py-3 gap-3">
        <button onClick={onToggle} className="p-2 rounded-lg text-muted hover:text-heading hover:bg-surface-hover transition-colors" title="Expand sidebar">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <button onClick={onNew} className="p-2 rounded-lg text-muted hover:text-cyan-600 hover:bg-surface-hover transition-colors" title="New chat">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="w-72 border-r border-edge-subtle bg-surface flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-edge-subtle flex items-center gap-2">
        <button onClick={onToggle} className="p-1.5 rounded-lg text-muted hover:text-heading hover:bg-surface-hover transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <button
          onClick={onNew}
          className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-teal-500 text-white text-sm font-bold hover:shadow-md transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Chat
        </button>
      </div>

      {/* Search */}
      <div className="px-3 py-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search chats..."
          className="w-full rounded-lg border border-edge bg-surface-secondary px-3 py-1.5 text-sm text-heading placeholder:text-muted focus:ring-1 focus:ring-cyan-500"
        />
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {groups.map((group) => (
          <div key={group.label}>
            <p className="px-2 py-1.5 text-xs font-bold text-muted uppercase tracking-wider">{group.label}</p>
            {group.items.map((c) => (
              <div
                key={c.id}
                className={`group flex items-center gap-1 px-2 py-2 rounded-lg cursor-pointer transition-colors ${
                  activeId === c.id ? "bg-cyan-50 dark:bg-cyan-950/50 text-cyan-700" : "text-heading hover:bg-surface-hover"
                }`}
                onClick={() => onSelect(c.id)}
              >
                {editingId === c.id ? (
                  <input
                    autoFocus
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onBlur={() => {
                      if (editTitle.trim()) onRename(c.id, editTitle.trim());
                      setEditingId(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        if (editTitle.trim()) onRename(c.id, editTitle.trim());
                        setEditingId(null);
                      }
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    className="flex-1 text-sm bg-transparent border-b border-cyan-400 outline-none"
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <span className="flex-1 text-sm truncate">{c.title}</span>
                )}

                {/* Actions */}
                <div className="flex-shrink-0 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingId(c.id);
                      setEditTitle(c.title);
                    }}
                    className="p-1 rounded text-muted hover:text-heading"
                    title="Rename"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  {deleteConfirm === c.id ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(c.id);
                        setDeleteConfirm(null);
                      }}
                      className="p-1 rounded text-red-500 hover:text-red-700 text-xs font-bold"
                      title="Confirm delete"
                    >
                      Yes
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirm(c.id);
                        setTimeout(() => setDeleteConfirm(null), 3000);
                      }}
                      className="p-1 rounded text-muted hover:text-red-500"
                      title="Delete"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}
        {conversations.length === 0 && (
          <div className="text-center py-8 text-sm text-muted">
            No conversations yet
          </div>
        )}
      </div>
    </div>
  );
}
