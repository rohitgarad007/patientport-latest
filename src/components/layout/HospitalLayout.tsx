import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { HospitalAppSidebar } from "./HospitalAppSidebar";

interface HospitalLayoutProps {
  children: React.ReactNode;
}

export function HospitalLayout({ children }: HospitalLayoutProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        <HospitalAppSidebar />
        <div className="flex-1 flex flex-col pt-16">
         
          <main className="flex-1 p-6 bg-gradient-to-br from-background to-muted/20">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}