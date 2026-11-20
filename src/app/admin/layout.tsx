export const metadata = { title: "Админка — Техник", robots: { index: false, follow: false } };

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-[var(--color-ink)] text-[var(--color-text)]">{children}</div>;
}
