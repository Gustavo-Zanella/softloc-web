import { Sidebar } from '@/components/layout/sidebar';
import { AdminHeader } from '@/components/layout/header';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <AdminHeader />
      <main className="ml-64 pt-14 min-h-screen">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
