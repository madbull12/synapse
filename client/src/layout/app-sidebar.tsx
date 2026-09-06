"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

export function AppSidebar() {
  const [isChannelCollapsed, setIsChannelCollapsed] = useState(true);
  const [isDirectMessageCollapsed, setIsDirectMessageCollapsed] =
    useState(true);

  return (
    <Sidebar>
      <div className="flex h-full w-full overflow-hidden">
        <div className="h-full shrink-0 border-r border-border/40">
          <WorkspaceRail />
        </div>

        <div className="flex-1 flex flex-col h-full overflow-hidden bg-sidebar">
          <SidebarHeader className="p-2">
            <WorkspaceDropdown />
          </SidebarHeader>

          <Separator className="opacity-60" />

          <SidebarContent className="gap-y-2 px-2 overflow-y-auto">
            {/* Channels Group */}
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
                    <ChannelList />
                  </CollapsibleContent>
                </SidebarGroupContent>
              </Collapsible>
            </SidebarGroup>

            {/* Direct Messages Group */}
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
                    <DirectMessageList />
                  </CollapsibleContent>
                </SidebarGroupContent>
              </Collapsible>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter>
            <UserDropdown />
          </SidebarFooter>
        </div>
      </div>
    </Sidebar>
  );
}
