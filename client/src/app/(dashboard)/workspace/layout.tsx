import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { fetchUserWorkspaces } from "@/features/user/service/server";
import WorkspaceHeader from "@/features/workspace/components/workspace-header";
import { AppSidebar } from "@/layout/app-sidebar";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = new QueryClient();

  const workspaces = await fetchUserWorkspaces();

  await queryClient.prefetchQuery({
    queryKey: ["workspaces"],
    queryFn: async () => workspaces,
  });
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SidebarProvider
        style={{ "--sidebar-width": "24rem" } as React.CSSProperties}
      >
        <div className="flex h-screen w-screen overflow-hidden bg-background">
          <AppSidebar workspaces={workspaces} />

          <main className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
            <div className="flex-1 overflow-y-auto bg-background">
              <WorkspaceHeader />
              {children}
            </div>
          </main>
        </div>
      </SidebarProvider>
    </HydrationBoundary>
  );
}
