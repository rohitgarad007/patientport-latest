import { LaboratoryAppSidebar } from "./LaboratoryAppSidebar";

interface LaboratoryLayoutProps {
  children: React.ReactNode;
}

export function LaboratoryLayout({ children }: LaboratoryLayoutProps) {
  return (
    <div className="min-h-screen flex w-full bg-background">
      <LaboratoryAppSidebar />
      <div className="flex-1 flex flex-col pt-16">
        <main className="flex-1 p-6 bg-gradient-to-br from-background to-muted/20">
          {children}
        </main>
      </div>
    </div>
  );
}
