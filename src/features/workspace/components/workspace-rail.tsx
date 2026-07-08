"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Mock workspaces data layer contract
const WORKSPACES_MOCK = [
  { id: "synapse", name: "Synapse Workspace", initials: "SW" },
  { id: "side-hustle", name: "Side Hustle Crew", initials: "SH" },
  { id: "ekspedingin", name: "Ekspedingin Dev", initials: "ED" },
];

export function WorkspaceRail() {
  const params = useParams();
  const activeWorkspaceId = params?.workspaceId as string;

  return (
    <div className="flex h-full p-3 flex-col items-center gap-y-4 border-r border-border bg-sidebar-background py-3 select-none">
      {/* Workspace Icons List */}
      <div className="flex w-full flex-1 flex-col items-center gap-y-3">
        {WORKSPACES_MOCK.map((workspace) => {
          const isActive = activeWorkspaceId === workspace.id;

          return (
            <Tooltip key={workspace.id}>
              <TooltipTrigger asChild>
                <Link
                  href={`/${workspace.id}`}
                  className="group relative flex items-center justify-center"
                >
                  {/* Left Pill Highlight Indicator Indicator */}
                  <div
                    className={cn(
                      "absolute left-0 w-1 bg-foreground rounded-r-full transition-all duration-200 origin-left",
                      isActive ? "h-8" : "h-0 group-hover:h-4",
                    )}
                  />

                  {/* Workspace Avatar Frame */}
                  <Avatar
                    className={cn(
                      "size-11 transition-all duration-200 rounded-2xl cursor-pointer font-semibold text-sm",
                      isActive
                        ? "rounded-xl bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:rounded-xl hover:bg-accent hover:text-accent-foreground",
                    )}
                  >
                    <AvatarFallback className="bg-transparent">
                      {workspace.initials}
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

      {/* Global Workspace Action Trigger Trigger */}
      <Tooltip>
        <TooltipTrigger asChild>
          <button className="flex size-11 items-center justify-center rounded-2xl border border-dashed border-border text-muted-foreground hover:rounded-xl hover:bg-muted hover:text-foreground transition-all duration-200">
            <Plus className="size-5" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={12}>
          <p className="text-xs">Add a workspace</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
