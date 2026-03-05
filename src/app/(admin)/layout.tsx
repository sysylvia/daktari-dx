import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚙️</span>
            <h1 className="font-bold">Daktari Dx Admin</h1>
          </div>
          <nav className="flex gap-4 text-sm">
            <Link href="/admin/cases" className="hover:underline">Cases</Link>
            <Link href="/admin/export" className="hover:underline">Export</Link>
            <Link href="/" className="text-muted-foreground hover:underline">Back to App</Link>
          </nav>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}
