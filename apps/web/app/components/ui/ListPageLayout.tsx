"use client";

import { ReactNode } from "react";
import { PageHeader } from "./PageHeader";

interface ListPageLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function ListPageLayout({
  title,
  subtitle,
  children,
}: ListPageLayoutProps) {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 relative">
      <div className="absolute top-20 right-10 w-24 h-24 bg-cyan-200 rounded-full opacity-20 blur-2xl animate-float" />
      <PageHeader title={title} subtitle={subtitle} />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {children}
      </div>
    </div>
  );
}
