"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLogout } from "@/features/auth/hooks/mutations/use-auth";
import { useAuthStore } from "@/features/auth/store/use-auth-store";
import { useUserProfile } from "@/features/user/hooks/queries/use-user";
import { ChevronDown, LogOut } from "lucide-react";

const UserDropdown = () => {
  const { mutate: logout, isPending } = useLogout();
  const userId = useAuthStore((state) => state.userId);

  const { data: userProfile } = useUserProfile(userId!);

  console.log("User profile: ", userProfile);

  const handleLogout = () => {
    logout();
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-12 w-full flex items-center justify-start gap-2 px-2 hover:bg-muted/60 data-[state=open]:bg-muted/60 transition-all focus-visible:ring-1 focus-visible:ring-ring"
        >
          <Avatar className="size-8">
            <AvatarImage
              className="rounded-lg"
              src={`https://api.dicebear.com/7.x/initials/svg?seed=${userProfile?.name}`}
            />
            <AvatarFallback className="bg-primary/10 text-primary font-medium text-xs">
              {userProfile?.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col items-start min-w-0 leading-tight">
            <span className="font-semibold text-sm text-foreground truncate w-full text-left">
              {userProfile?.name}
            </span>
            {/* <span className="text-[10px] text-muted-foreground font-medium tracking-wider uppercase">
              {a}
            </span> */}
          </div>

          <ChevronDown className="ml-auto size-4 text-muted-foreground shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem
          onClick={handleLogout}
          className="flex items-center gap-2 px-2 py-1.5 cursor-pointer rounded-md text-destructive focus:text-destructive focus:bg-destructive/10"
        >
          <LogOut className="size-4 shrink-0" />
          <span className="text-xs font-medium">
            {isPending ? "Signing out..." : "Sign out"}
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserDropdown;
