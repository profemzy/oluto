"use client";

import { useState, useEffect } from "react";
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
  mobileOpen?: boolean;
  onMobileClose?: () => void;
  locale: "en-CA" | "fr-CA";
  onLocaleChange: (locale: "en-CA" | "fr-CA") => void;
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / 86400000);

  // Same day — show time
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString("en-CA", { hour: "2-digit", minute: "2-digit" });
  }

  // Yesterday
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }

  // Within 7 days
  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }

  // Older
  return date.toLocaleDateString("en-CA", { month: "short", day: "numeric" });
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

function SidebarContent({
  conversations,
  activeId,
  onSelect,
  onNew,
  onRename,
  onDelete,
  onToggle,
  onMobileClose,
  locale,
  onLocaleChange,
}: Omit<ChatSidebarProps, "collapsed" | "mobileOpen">) {
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filtered = search
    ? conversations.filter((c) => c.title.toLowerCase().includes(search.toLowerCase()))
    : conversations;

  const groups = groupByDate(filtered);

  const handleSelect = (id: string) => {
    onSelect(id);
    onMobileClose?.();
  };

  return (
    <div className="flex h-full w-72 flex-col bg-surface border-r border-edge">
      {/* Header */}
      <div className="border-b border-edge p-3">
        <div className="mb-3 flex items-center justify-between gap-2">
          {/* Logo + title */}
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-[#087E78] text-white">
              <span className="text-xs font-bold">O</span>
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-bold text-heading">Oluto</p>
              <p className="truncate text-[10px] text-muted">Agent Operations</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onMobileClose || onToggle}
            aria-label="Collapse conversation sidebar"
            className="rounded-lg p-1.5 text-muted hover:text-heading hover:bg-surface-hover transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)]"
            title="Collapse conversation sidebar"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
              />
            </svg>
          </button>
        </div>

        {/* New Chat button */}
        <button
          type="button"
          onClick={() => {
            onNew();
            onMobileClose?.();
          }}
          aria-label="Start new conversation"
          className="btn-primary w-full py-2 px-3 text-xs flex items-center justify-center gap-2"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Conversation
        </button>
      </div>

      {/* Search */}
      <div className="px-3 py-2 border-b border-edge-subtle">
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations..."
            aria-label="Search conversations"
            className="w-full rounded-xl border border-edge bg-surface-secondary px-3 py-1.5 pl-8 text-xs text-heading transition-colors placeholder:text-muted focus:border-[var(--color-brand-primary)] focus:ring-1 focus:ring-[var(--color-brand-primary)] focus:outline-none"
          />
          <svg
            className="absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-muted pointer-events-none"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Clear search"
              className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted hover:text-heading"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
        <label className="mt-2 block text-[10px] font-semibold text-muted uppercase tracking-wider">
          Agent language
          <select
            aria-label="Agent language"
            value={locale}
            onChange={(event) => onLocaleChange(event.target.value as "en-CA" | "fr-CA")}
            className="mt-1 w-full rounded-lg border border-edge bg-surface px-2 py-1 text-xs text-heading focus:ring-1 focus:ring-[var(--color-brand-primary)] focus:outline-none"
          >
            <option value="en-CA">English (Canada)</option>
            <option value="fr-CA">Français (Canada)</option>
          </select>
        </label>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-3">
        {groups.map((group) => (
          <div key={group.label} className="space-y-0.5">
            <p className="px-2 py-1 text-[10px] font-bold tracking-wider text-muted uppercase">
              {group.label}
            </p>
            {group.items.map((c) => (
              <div
                key={c.id}
                className={`group relative flex items-center gap-1 rounded-xl transition-all ${
                  activeId === c.id
                    ? "bg-teal-50 dark:bg-teal-950/40 border border-teal-300 dark:border-teal-800"
                    : "hover:bg-surface-secondary border border-transparent"
                }`}
              >
                <button
                  type="button"
                  onClick={() => handleSelect(c.id)}
                  aria-label={`Open conversation: ${c.title}`}
                  className="flex min-w-0 flex-1 items-center gap-2.5 p-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] rounded-lg min-h-[44px]"
                >
                  <div
                    className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg ${
                      activeId === c.id
                        ? "bg-[#087E78] text-white"
                        : "bg-surface-secondary text-muted"
                    }`}
                  >
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                      />
                    </svg>
                  </div>

                  <div className="min-w-0 flex-1">
                    <p
                      className={`truncate text-xs font-semibold ${
                        activeId === c.id
                          ? "text-heading font-bold"
                          : "text-body"
                      }`}
                    >
                      {c.title}
                    </p>
                    <p className="truncate text-[10px] text-muted font-tabular">
                      {formatRelativeTime(c.updated_at)}
                    </p>
                  </div>
                </button>

                {/* Inline rename input or action buttons */}
                {editingId === c.id ? (
                  <div className="absolute inset-0 z-10 flex items-center bg-surface px-2 rounded-xl border border-[var(--color-brand-primary)]">
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
                      className="flex-1 bg-transparent text-xs text-heading outline-none py-1.5"
                      aria-label="Edit conversation title"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-0.5 pr-1.5 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingId(c.id);
                        setEditTitle(c.title);
                      }}
                      className="rounded p-1 text-muted hover:text-heading hover:bg-surface-hover transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)]"
                      title="Rename conversation"
                      aria-label={`Rename conversation ${c.title}`}
                    >
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    {deleteConfirm === c.id ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(c.id);
                          setDeleteConfirm(null);
                        }}
                        className="rounded px-2 py-1 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors min-h-[36px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                        title="Confirm delete"
                        aria-label={`Confirm delete conversation ${c.title}`}
                      >
                        Yes
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirm(c.id);
                          setTimeout(() => setDeleteConfirm(null), 3000);
                        }}
                        className="rounded p-1 text-muted hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                        title="Delete conversation"
                        aria-label={`Delete conversation ${c.title}`}
                      >
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
        {conversations.length === 0 && (
          <div className="py-8 text-center text-xs text-muted">No conversations yet</div>
        )}
      </div>
    </div>
  );
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
  mobileOpen,
  onMobileClose,
  locale,
  onLocaleChange,
}: ChatSidebarProps) {
  // Focus trapping and Escape key for mobile drawer
  useEffect(() => {
    if (!mobileOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onMobileClose?.();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileOpen, onMobileClose]);

  // Collapsed rail (desktop only when collapsed)
  if (collapsed && !mobileOpen) {
    return (
      <div className="hidden w-16 flex-col items-center gap-3 border-r border-edge bg-surface py-3 md:flex">
        <button
          type="button"
          onClick={onToggle}
          className="rounded-lg p-2 text-muted hover:text-heading hover:bg-surface-hover transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)]"
          title="Expand conversation sidebar"
          aria-label="Expand conversation sidebar"
          aria-expanded="false"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <button
          type="button"
          onClick={onNew}
          className="rounded-lg p-2 text-muted hover:text-[var(--color-brand-primary)] hover:bg-surface-hover transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)]"
          title="New conversation"
          aria-label="Start new conversation"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    );
  }

  // Mobile / Tablet overlay drawer (for < 1280px or mobileOpen)
  if (mobileOpen) {
    return (
      <div className="fixed inset-0 z-50 xl:hidden">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
          onClick={onMobileClose}
          aria-hidden="true"
        />
        {/* Drawer */}
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Conversation history"
          className="fixed inset-y-0 left-0 z-50 w-72 bg-surface shadow-2xl border-r border-edge flex flex-col focus:outline-none"
        >
          <SidebarContent
            conversations={conversations}
            activeId={activeId}
            onSelect={onSelect}
            onNew={onNew}
            onRename={onRename}
            onDelete={onDelete}
            onToggle={onToggle}
            onMobileClose={onMobileClose}
            locale={locale}
            onLocaleChange={onLocaleChange}
          />
        </div>
      </div>
    );
  }

  // Desktop expanded sidebar: visible on xl (>= 1280px) or when not collapsed
  return (
    <div className="hidden border-r border-edge bg-surface xl:flex flex-shrink-0">
      <SidebarContent
        conversations={conversations}
        activeId={activeId}
        onSelect={onSelect}
        onNew={onNew}
        onRename={onRename}
        onDelete={onDelete}
        onToggle={onToggle}
        locale={locale}
        onLocaleChange={onLocaleChange}
      />
    </div>
  );
}
