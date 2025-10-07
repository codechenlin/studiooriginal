// This layout is now empty because the main admin layout has moved to /panel.
// This file is kept to ensure routing group works correctly.
export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
