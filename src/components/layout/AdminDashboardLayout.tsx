// AdminDashboardLayout.tsx
import { SidebarProvider } from '@/components/ui/sidebar';
import { AdminAppSidebar } from './AdminAppSidebar';

import { MenuItem } from '@/types/sidebar';

interface AdminDashboardLayoutProps {
  children: React.ReactNode;
  sidebarItems?: MenuItem[]; // ✅ dynamic sidebar items
}

export function AdminDashboardLayout({ children, sidebarItems }: AdminDashboardLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminAppSidebar menuItems={sidebarItems} /> {/* ✅ pass items */}
        <div className="flex-1 flex flex-col">
         
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
