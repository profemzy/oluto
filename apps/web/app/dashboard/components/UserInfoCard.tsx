"use client";

import { User } from "@/app/lib/api";

interface UserInfoCardProps {
  user: User;
  role?: string | null;
}

export function UserInfoCard({ user, role }: UserInfoCardProps) {
  const displayRole = role ?? user.role;

  return (
    <div className="card-financial p-5">
      <h2 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Account Profile</h2>
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-[#0B1825] text-white flex items-center justify-center font-bold text-sm tracking-tight flex-shrink-0">
          {user.full_name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-heading truncate">{user.full_name}</p>
          <p className="text-xs text-muted truncate">{user.email}</p>
        </div>
      </div>
      <div className="mt-4 pt-3 border-t border-edge flex items-center justify-between">
        <span className="text-xs text-muted">Active Role</span>
        <span className="status-badge status-badge-neutral capitalize">{displayRole}</span>
      </div>
    </div>
  );
}
