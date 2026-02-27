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
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
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
    <div className="w-72 flex flex-col h-full bg-white dark:bg-[#0f0f18]">
      {/* Header */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={onToggle}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Logo + title */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-white">O</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-900 dark:text-white truncate">Oluto</p>
              <p className="text-[10px] text-gray-400 truncate">Financial Assistant</p>
            </div>
          </div>
        </div>

        {/* New Chat button */}
        <button
          onClick={() => { onNew(); onMobileClose?.(); }}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 text-white text-sm font-bold hover:shadow-lg hover:shadow-cyan-500/25 transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Chat
        </button>
      </div>

      {/* Search */}
      <div className="px-3 py-2">
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search chats..."
            className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-3 py-2 pl-9 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-400 transition-colors"
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {groups.map((group) => (
          <div key={group.label}>
            <p className="px-2 py-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              {group.label}
            </p>
            {group.items.map((c) => (
              <div
                key={c.id}
                className={`group flex items-center gap-2 px-2 py-2.5 rounded-xl cursor-pointer transition-all ${
                  activeId === c.id
                    ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
                    : "hover:bg-gray-50 dark:hover:bg-gray-800/50 border border-transparent"
                }`}
                onClick={() => handleSelect(c.id)}
              >
                {/* Chat icon */}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  activeId === c.id
                    ? "bg-blue-100 dark:bg-blue-800/30 text-blue-600 dark:text-blue-400"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-400"
                }`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>

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
                    className="flex-1 text-sm bg-transparent border-b border-cyan-400 outline-none text-gray-900 dark:text-white"
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm truncate ${
                      activeId === c.id
                        ? "font-medium text-blue-700 dark:text-blue-300"
                        : "text-gray-700 dark:text-gray-300"
                    }`}>
                      {c.title}
                    </p>
                    <p className="text-[10px] text-gray-400 truncate">
                      {formatRelativeTime(c.updated_at)}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex-shrink-0 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingId(c.id);
                      setEditTitle(c.title);
                    }}
                    className="p-1 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
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
                      className="p-1 rounded text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 text-xs font-bold"
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
                      className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
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
          <div className="text-center py-8 text-sm text-gray-400">
            No conversations yet
          </div>
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
}: ChatSidebarProps) {
  // Collapsed sidebar (desktop only)
  if (collapsed && !mobileOpen) {
    return (
      <div className="hidden md:flex w-14 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0f0f18] flex-col items-center py-3 gap-3">
        <button
          onClick={onToggle}
          className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-500 text-white shadow-md hover:shadow-lg transition-all"
          title="Expand sidebar"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <button
          onClick={onNew}
          className="p-2 rounded-xl text-gray-400 hover:text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 transition-colors"
          title="New chat"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    );
  }

  // Mobile overlay sidebar
  if (mobileOpen) {
    return (
      <>
        {/* Backdrop */}
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={onMobileClose}
        />
        {/* Sidebar */}
        <div className="fixed inset-y-0 left-0 z-50 md:hidden shadow-2xl">
          <SidebarContent
            conversations={conversations}
            activeId={activeId}
            onSelect={onSelect}
            onNew={onNew}
            onRename={onRename}
            onDelete={onDelete}
            onToggle={onToggle}
            onMobileClose={onMobileClose}
          />
        </div>
      </>
    );
  }

  // Desktop expanded sidebar
  return (
    <div className="hidden md:flex border-r border-gray-200 dark:border-gray-800">
      <SidebarContent
        conversations={conversations}
        activeId={activeId}
        onSelect={onSelect}
        onNew={onNew}
        onRename={onRename}
        onDelete={onDelete}
        onToggle={onToggle}
      />
    </div>
  );
}
