import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ReceptionAppSidebar } from "./ReceptionAppSidebar";

interface ReceptionLayoutProps {
  children: React.ReactNode;
}

export function ReceptionLayout({ children }: ReceptionLayoutProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="w-full sm:max-w-full max-w-[100%] mx-auto min-h-screen flex w-full bg-background xs-mbody">
        <ReceptionAppSidebar />
        <div className="w-full sm:max-w-full max-w-[100%] mx-auto flex-1 flex flex-col pt-16 sx-pagebody">
         
          <main className="w-full sm:max-w-full max-w-[100%] mx-auto flex-1 p-6 bg-gradient-to-br from-background to-muted/20 sx-col">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}