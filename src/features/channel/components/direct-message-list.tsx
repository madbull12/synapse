"use client";

import * as React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getPersistentColor, getInitials } from "@/lib/avatar";

const DirectMessageList = () => {
  const names = [
    "alice",
    "bob",
    "charlie",
    "diana",
    "eve",
    "frank",
    "grace",
    "henry",
  ];

  return (
    <ScrollArea className="h-full max-h-[500px] w-full">
      <div className="flex flex-col gap-y-1">
        {names.map((name) => {
          const backgroundColor = getPersistentColor(name);
          const initials = getInitials(name);

          return (
            <div
              key={name}
              className="text-sm flex items-center gap-x-3 cursor-pointer rounded-md p-2 font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors group"
            >
              <Avatar
                size="sm"
                className=" text-[10px] font-semibold text-white select-none"
              >
                <AvatarImage
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${name}`}
                  alt={name}
                />
                <AvatarFallback
                  style={{ backgroundColor }}
                  className="transition-opacity duration-200"
                >
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="truncate capitalize">{name}</span>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
};

export default DirectMessageList;
