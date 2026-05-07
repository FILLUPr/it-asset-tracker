import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'IT Asset Tracker',
  description: 'ระบบแจ้งซ่อม/บันทึกอุปกรณ์ IT',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body className="min-h-screen">
        <nav className="sticky top-0 z-50 border-b"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
            <a href="/" className="text-lg font-bold" style={{ color: 'var(--accent)' }}>
              IT Asset Tracker
            </a>
            <div className="flex gap-4 text-sm">
              <a href="/" style={{ color: 'var(--text-muted)' }}>หน้าแรก</a>
              <a href="/scan" style={{ color: 'var(--text-muted)' }}>แจ้งซ่อม</a>
              <a href="/dashboard" style={{ color: 'var(--text-muted)' }}>Dashboard</a>
            </div>
          </div>
        </nav>
        <main className="max-w-5xl mx-auto px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
