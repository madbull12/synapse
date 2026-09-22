"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import CreateWorkspaceModal from "@/features/workspace/components/create-workspace-modal";
import { useAuthStore } from "@/features/auth/store/use-auth-store";
import { useWorkspaces } from "@/features/workspace/hooks/queries/use-workspace";
import { useQueryClient } from "@tanstack/react-query";
import { workspaceService } from "../service";

export function WorkspaceRail() {
  const queryClient = useQueryClient();
  const params = useParams();
  const activeWorkspaceId = params?.workspaceId as string;

  const userId = useAuthStore((state) => state.userId);
  const { data } = useWorkspaces(userId!);

  const prefetchWorkspaceDetail = (workspaceId: string) => {
    queryClient.prefetchQuery({
      queryKey: ["workspace", workspaceId],
      queryFn: async () => workspaceService.getWorkspaceById(workspaceId),
      staleTime: 1000 * 60 * 5, // Keep cache fresh for 5 mins
    });
  };

  return (
    <div className="flex h-full p-3 flex-col items-center gap-y-4 border-r border-border bg-sidebar-background py-3 select-none">
      {/* Workspace Icons List */}
      <div className="flex w-full flex-1 flex-col items-center gap-y-3">
        {data?.data?.map((workspace) => {
          const isActive = activeWorkspaceId === workspace.id;

          return (
            <Tooltip key={workspace.id}>
              <TooltipTrigger asChild>
                <Link
                  href={`/workspace/${workspace.id}`}
                  onMouseEnter={() => prefetchWorkspaceDetail(workspace.id)}
                  className="group relative flex items-center justify-center"
                >
                  <div
                    className={cn(
                      "absolute -left-2 w-1 bg-primary rounded-full transition-all duration-200 ease-out",
                      isActive ? "h-8" : "h-0 ",
                    )}
                  />

                  {/* Workspace Avatar Frame */}
                  <Avatar
                    className={cn(
                      "size-11 rounded-2xl cursor-pointer font-semibold text-sm transition-all duration-200 ease-out",
                    )}
                  >
                    {workspace.logo_url && (
                      <AvatarImage
                        src={workspace.logo_url}
                        alt={workspace.name}
                        className="object-cover"
                      />
                    )}
                    <AvatarFallback
                      className={cn(
                        "transition-colors duration-200",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground group-hover:text-foreground",
                      )}
                    >
                      {workspace.name
                        .split(" ")
                        .slice(0, 2)
                        .map((word: string) => word[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={12}>
                <p className="font-medium text-xs">{workspace.name}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>

      <CreateWorkspaceModal children={<Plus className="size-5" />} />
    </div>
  );
}
