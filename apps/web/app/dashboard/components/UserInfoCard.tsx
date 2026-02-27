"use client";

import { User } from "@/app/lib/api";

interface UserInfoCardProps {
  user: User;
}

export function UserInfoCard({ user }: UserInfoCardProps) {
  return (
    <div className="group bg-surface rounded-2xl border border-edge-subtle shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-6">
      <h2 className="text-lg font-bold text-heading mb-4">Account</h2>
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-cyan-500 to-green-500 flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 group-hover:shadow-cyan-500/30 transition-all duration-300">
          {user.full_name.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-sm font-bold text-heading">{user.full_name}</p>
          <p className="text-xs text-muted">{user.email}</p>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-edge-subtle">
        <p className="text-xs text-muted">
          Role: <span className="font-bold capitalize text-cyan-600">{user.role}</span>
        </p>
      </div>
    </div>
  );
}
