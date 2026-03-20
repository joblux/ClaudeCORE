export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Standalone layout — no Header/Footer for admin panel
  return children
}
