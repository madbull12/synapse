"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getPersistentColor, getInitials } from "@/lib/avatar";
import { WorkspaceMember } from "@/features/workspace/types/api";

interface Props {
  workspaceMembers: WorkspaceMember[]
}

const DirectMessageList = ({ workspaceMembers }: Props) => {


  return (
    <ScrollArea className="h-full max-h-125 w-full">
      <div className="flex flex-col gap-y-1">
        {workspaceMembers.map((member) => {
          const backgroundColor = getPersistentColor(member.user.name);
          const initials = getInitials(member.user.name);

          console.log("Initials: ", initials)
          return (
            <div
              key={member.user_id}
              className="text-sm flex items-center gap-x-3 cursor-pointer rounded-md p-2 font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors group"
            >
              <Avatar
                size="sm"
                className=" text-[10px] font-semibold text-white select-none"
              >
                <AvatarImage
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${member.user.name}`}
                  alt={member.user.name}
                />
                <AvatarFallback
                  style={{ backgroundColor }}
                  className="transition-opacity duration-200 "
                >
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="truncate capitalize">{member.user.name}</span>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
};

export default DirectMessageList;
