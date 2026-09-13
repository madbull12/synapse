import { Hash, Info, Pin, Search } from "lucide-react";
import AvatarGroupMembers from "@/features/workspace/components/avatar-group-members";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SidebarTrigger } from "@/components/ui/sidebar";

const WorkspaceHeader = () => {
  return (
    <header className="px-4 shrink-0 flex items-center justify-between p-4 border-b border-border/40 bg-background">
      <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
        <SidebarTrigger />
        <Hash />
        <span>general</span>
      </div>
      <div className="flex items-center gap-2">
        <AvatarGroupMembers />
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

export default WorkspaceHeader;
