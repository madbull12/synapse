import { ScrollArea } from "@/components/ui/scroll-area";
import { useParams } from "next/navigation";
import { useWorkspaceChannels } from "@/features/channel/hooks/queries/use-channel";
import Link from "next/link";
import { cn } from "@/lib/utils";

const ChannelList = () => {
  const { workspaceId, channelName } = useParams();

  const { data: channels } = useWorkspaceChannels(workspaceId as string);

  const activeChannelName = channelName as string;
  return (
    <ScrollArea className="h-full">
      <div className="max-h-125 px-2 py-1 space-y-0.5">
        {channels.data.map((channel) => {
          const isActive = activeChannelName === channel.name;

          return (
            <Link
              key={channel.id}
              href={`/workspace/${workspaceId}/channel/${channel.name}`}
            >
              <div
                className={cn(
                  "text-sm flex items-center gap-x-2 cursor-pointer rounded-md px-2.5 py-1.5 font-medium transition-colors",
                  isActive
                    ? "bg-muted text-foreground font-semibold"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                )}
              >
                <span>#</span>
                <span className="truncate">{channel.name}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </ScrollArea>
  );
};

export default ChannelList;
