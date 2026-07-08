import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/layout/app-sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider
      style={{ "--sidebar-width": "24rem" } as React.CSSProperties}
    >
      <div className="flex h-screen w-screen overflow-hidden bg-background">
        <AppSidebar />

        <main className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
          <div className="h-12 px-4 shrink-0 flex items-center border-b border-border/40 bg-background">
            <SidebarTrigger />
          </div>

          <div className="flex-1 overflow-y-auto p-6 bg-background">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
