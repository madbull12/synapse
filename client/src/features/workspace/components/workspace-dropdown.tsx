"use client";

import * as React from "react";
import { ChevronDown, Settings, UserPlus, LogOut, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function WorkspaceDropdown() {
  // This will eventually tie into your active workspace state
  const activeWorkspace = {
    name: "My Workspace",
    initials: "M",
    role: "Admin",
    memberCount: 32, // Reflecting your squad count context!
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-12 w-full flex items-center justify-start gap-2 px-2 hover:bg-muted/60 data-[state=open]:bg-muted/60 transition-all focus-visible:ring-1 focus-visible:ring-ring"
        >
          {/* Active Workspace Avatar */}
          <div className="bg-primary text-primary-foreground rounded-lg size-8 shrink-0 grid place-items-center font-bold text-sm">
            {activeWorkspace.initials}
          </div>

          {/* Stacked Workspace Name & Role */}
          <div className="flex flex-col items-start min-w-0 leading-tight">
            <span className="font-semibold text-sm text-foreground truncate w-full text-left">
              {activeWorkspace.name}
            </span>
            <span className="text-[10px] text-muted-foreground font-medium tracking-wider uppercase">
              {activeWorkspace.role}
            </span>
          </div>

          <ChevronDown className="ml-auto size-4 text-muted-foreground shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-56 p-1.5 shadow-lg"
        align="start"
        sideOffset={8}
      >
        {/* Workspace Info Card */}
        <div className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-muted/40 mb-1">
          <div className="bg-primary text-primary-foreground rounded-md size-7 shrink-0 grid place-items-center font-semibold text-xs">
            {activeWorkspace.initials}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-xs truncate text-foreground">
              {activeWorkspace.name}
            </span>
            <span className="text-[10px] text-muted-foreground truncate">
              {activeWorkspace.memberCount} members
            </span>
          </div>
        </div>

        <DropdownMenuSeparator className="my-1" />

        {/* Workspace Management Group */}
        <DropdownMenuLabel className="px-2 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
          Workspace
        </DropdownMenuLabel>

        <DropdownMenuGroup className="space-y-0.5">
          <DropdownMenuItem className="flex items-center gap-2 px-2 py-1.5 cursor-pointer rounded-md">
            <UserPlus className="size-4 text-muted-foreground shrink-0" />
            <span className="text-xs text-foreground font-medium">
              Invite members
            </span>
          </DropdownMenuItem>

          <DropdownMenuItem className="flex items-center gap-2 px-2 py-1.5 cursor-pointer rounded-md">
            <Users className="size-4 text-muted-foreground shrink-0" />
            <span className="text-xs text-foreground font-medium">
              Manage members
            </span>
          </DropdownMenuItem>

          <DropdownMenuItem className="flex items-center gap-2 px-2 py-1.5 cursor-pointer rounded-md">
            <Settings className="size-4 text-muted-foreground shrink-0" />
            <span className="text-xs text-foreground font-medium">
              Workspace settings
            </span>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="my-1" />

        {/* Account / Actions Group */}
        <DropdownMenuLabel className="px-2 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
          My Account
        </DropdownMenuLabel>

        <DropdownMenuGroup className="space-y-0.5">
          <DropdownMenuItem className="flex items-center gap-2 px-2 py-1.5 cursor-pointer rounded-md">
            <Settings className="size-4 text-muted-foreground shrink-0" />
            <span className="text-xs text-foreground font-medium">
              Preferences
            </span>
          </DropdownMenuItem>

          <DropdownMenuItem className="flex items-center gap-2 px-2 py-1.5 cursor-pointer rounded-md text-destructive focus:text-destructive focus:bg-destructive/10">
            <LogOut className="size-4 shrink-0" />
            <span className="text-xs font-medium">
              Sign out of {activeWorkspace.initials}
            </span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
