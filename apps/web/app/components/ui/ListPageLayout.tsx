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
    <div className="min-h-[calc(100vh-4rem)] bg-surface-secondary overflow-x-hidden">
      <PageHeader title={title} subtitle={subtitle} />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 relative z-10">
        {children}
      </div>
    </div>
  );
}
