
"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import DashboardLayout from '@/app/dashboard/layout';

export default function TemplatesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // If we are on the template creation page, render children directly without the dashboard layout.
  if (pathname === '/dashboard/templates/create') {
    return <>{children}</>;
  }

  // Otherwise, wrap the children with the main DashboardLayout.
  return <DashboardLayout>{children}</DashboardLayout>;
}
