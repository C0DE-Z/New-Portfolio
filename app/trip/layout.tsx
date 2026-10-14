export default function TripLayout({ children }: { children: React.ReactNode }) {
  return <main className="fixed inset-0 z-50 bg-black font-mono">{children}</main>;
}
