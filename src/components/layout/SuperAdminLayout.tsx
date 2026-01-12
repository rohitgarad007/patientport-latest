import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminAppSidebar } from "./AdminAppSidebar";

interface SuperAdminLayoutProps {
  children: React.ReactNode;
}

export function SuperAdminLayout({ children }: SuperAdminLayoutProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        <AdminAppSidebar />
        <div className="flex-1 flex flex-col pt-16">
         
          <main className="flex-1 p-6 bg-gradient-to-br from-background to-muted/20">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}