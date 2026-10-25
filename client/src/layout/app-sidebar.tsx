"use client";

import { Suspense, useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, Plus, FolderPlus } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
} from "@/components/ui/sidebar";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { WorkspaceRail } from "@/features/workspace/components/workspace-rail";
import CreateChannelModal from "@/features/channel/components/create-channel-modal";
import ChannelList from "@/features/channel/components/channel-list";
import DirectMessageList from "@/features/channel/components/direct-message-list";
import WorkspaceDropdown from "@/features/workspace/components/workspace-dropdown";
import UserDropdown from "@/features/workspace/components/user-dropdown";
import CreateWorkspaceModal from "@/features/workspace/components/create-workspace-modal";
import {
  useWorkspaceById,
  useWorkspaces,
} from "@/features/workspace/hooks/queries/use-workspace";
import { useParams } from "next/navigation";
import { WorkspaceDTO } from "@/features/workspace/types/api";
import { ChannelListSkeleton } from "@/features/channel/components/channel-list-skeleton";
import { useAuthStore } from "@/features/auth/store/use-auth-store";
import { AppSidebarSkeleton } from "./app-sidebar-skeleton";

export function AppSidebar() {
  const [isChannelCollapsed, setIsChannelCollapsed] = useState(true);
  const [isDirectMessageCollapsed, setIsDirectMessageCollapsed] =
    useState(true);

  const { workspaceId } = useParams();
  const { data } = useWorkspaceById(workspaceId as string);
  const userId = useAuthStore((state) => state.userId);
  const { data: workspaces, isFetching } = useWorkspaces(userId);
  const hasWorkspaces = workspaces && workspaces.data.length > 0;

  return (
    <Sidebar className="transition-[width] duration-200">
      <div className="flex h-full w-full overflow-hidden">
        {isFetching ? (
          <AppSidebarSkeleton />
        ) : (
          <>
            {hasWorkspaces && data ? (
              <div className="h-full shrink-0 border-r border-border/40">
                <WorkspaceRail />
              </div>
            ) : null}

            <div className="flex-1 flex flex-col h-full overflow-hidden bg-sidebar">
              {hasWorkspaces && data ? (
                <>
                  <SidebarHeader className="p-2">
                    <WorkspaceDropdown workspaceById={data.data} />
                  </SidebarHeader>

                  <Separator className="opacity-60" />

                  <SidebarContent className="gap-y-2 px-2 overflow-y-auto">
                    <SidebarGroup className="p-0">
                      <Collapsible
                        open={isChannelCollapsed}
                        onOpenChange={setIsChannelCollapsed}
                      >
                        <CollapsibleTrigger asChild>
                          <div className="flex items-center justify-between w-full p-2 rounded-md hover:bg-muted/40 cursor-pointer group transition-colors">
                            <div className="flex items-center gap-x-2">
                              <ChevronDown
                                className={cn(
                                  "size-3.5 text-muted-foreground transition-transform duration-200",
                                  !isChannelCollapsed && "-rotate-90",
                                )}
                              />
                              <SidebarGroupLabel className="tracking-wider uppercase font-bold text-xs text-muted-foreground select-none h-auto p-0">
                                Channels
                              </SidebarGroupLabel>
                            </div>
                            <div onClick={(e) => e.stopPropagation()}>
                              <CreateChannelModal />
                            </div>
                          </div>
                        </CollapsibleTrigger>
                        <SidebarGroupContent>
                          <CollapsibleContent>
                            <Suspense fallback={<ChannelListSkeleton />}>
                              <ChannelList />
                            </Suspense>
                          </CollapsibleContent>
                        </SidebarGroupContent>
                      </Collapsible>
                    </SidebarGroup>

                    <SidebarGroup className="p-0">
                      <Collapsible
                        open={isDirectMessageCollapsed}
                        onOpenChange={setIsDirectMessageCollapsed}
                      >
                        <CollapsibleTrigger asChild>
                          <div className="flex items-center justify-between w-full p-2 rounded-md hover:bg-muted/40 cursor-pointer group transition-colors">
                            <div className="flex items-center gap-x-2">
                              <ChevronDown
                                className={cn(
                                  "size-3.5 text-muted-foreground transition-transform duration-200",
                                  !isDirectMessageCollapsed && "-rotate-90",
                                )}
                              />
                              <SidebarGroupLabel className="tracking-wider uppercase font-bold text-xs text-muted-foreground select-none h-auto p-0">
                                Direct Messages
                              </SidebarGroupLabel>
                            </div>
                          </div>
                        </CollapsibleTrigger>
                        <SidebarGroupContent>
                          <CollapsibleContent>
                            <DirectMessageList
                              workspaceMembers={data.data.members}
                            />
                          </CollapsibleContent>
                        </SidebarGroupContent>
                      </Collapsible>
                    </SidebarGroup>
                  </SidebarContent>
                </>
              ) : (
                /* Sleek Sidebar Empty State */
                <div className="flex-1 flex flex-col items-center justify-center p-4 text-center space-y-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                    <FolderPlus className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-foreground">
                      No Workspace
                    </p>
                    <p className="text-[11px] text-muted-foreground leading-tight">
                      Create a workspace to view channels and chats.
                    </p>
                  </div>
                  <CreateWorkspaceModal>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs gap-1.5 h-8"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      New Workspace
                    </Button>
                  </CreateWorkspaceModal>
                </div>
              )}

              <SidebarFooter className="mt-auto">
                <UserDropdown />
              </SidebarFooter>
            </div>
          </>
        )}
      </div>
    </Sidebar>
  );
}
