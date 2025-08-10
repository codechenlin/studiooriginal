
import React from 'react';

// This layout isolates the editor routes from the main dashboard layout.
export default function EditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
