import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DcotorAppSidebar } from "./DcotorAppSidebar";

interface DoctorLayoutProps {
  children: React.ReactNode;
}

export function DoctorLayout({ children }: DoctorLayoutProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        <DcotorAppSidebar />
        <div className="flex-1 flex flex-col pt-16">
         
          <main className="flex-1 p-0 bg-gradient-to-br from-background to-muted/20">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}