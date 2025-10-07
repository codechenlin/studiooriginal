// This is a new layout file to ensure the admin login page
// does not inherit the admin panel's main layout.
export default function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
