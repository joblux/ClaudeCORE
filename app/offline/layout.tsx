export default function OfflineLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Standalone layout | no Header/Footer so it works even if app is broken
  return children
}
