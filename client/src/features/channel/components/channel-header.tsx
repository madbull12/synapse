"use client";

import { Hash, Info, Pin, Search } from "lucide-react";
import AvatarGroupMembers from "@/features/workspace/components/avatar-group-members";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useParams } from "next/navigation";
import { useWorkspaceById } from "@/features/workspace/hooks/queries/use-workspace";
import { AvatarGroupSkeleton } from "@/features/channel/components/avatar-group-skeleton";

const ChannelHeader = () => {
  const { channelName, workspaceId } = useParams();
  const { data, isLoading } = useWorkspaceById(workspaceId as string);
  return (
    <header className="px-4 shrink-0 flex items-center justify-between p-4 border-b border-border/40 bg-background z-50 sticky top-0">
      <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
        <SidebarTrigger />
        <Hash />
        <span>{channelName}</span>
      </div>
      <div className="flex items-center gap-2">
        {isLoading ? (
          <AvatarGroupSkeleton />
        ) : (
          <AvatarGroupMembers workspaceMembers={data?.data.members ?? []} />
        )}

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon">
              <Pin />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Pinned Messages</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="icon" variant="ghost">
              <Search />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Search Messages</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="icon" variant="ghost">
              <Info />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Channel Details</TooltipContent>
        </Tooltip>
      </div>
    </header>
  );
};

export default ChannelHeader;
