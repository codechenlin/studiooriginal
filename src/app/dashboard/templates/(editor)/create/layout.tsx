
"use client";

import React from 'react';

export default function CreateTemplateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  React.useEffect(() => {
    document.body.classList.add('bg-editor-dark');
    return () => {
      document.body.classList.remove('bg-editor-dark');
    };
  }, []);

  return <>{children}</>;
}
