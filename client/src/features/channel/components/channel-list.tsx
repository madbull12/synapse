import { ScrollArea } from "@/components/ui/scroll-area";
import { useParams } from "next/navigation";
import { useWorkspaceChannels } from "@/features/channel/hooks/queries/use-channel";

const ChannelList = () => {
  // const channels = [
  //   "general",
  //   "product-design",
  //   "frontend",
  //   "backend",
  //   "marketing",
  //   "sales",
  //   "support",
  //   "random",
  // ];

  const { workspaceId } = useParams()

  const { data: channels } = useWorkspaceChannels(workspaceId as string);


  return (
    <ScrollArea>
      <div className="max-h-125">
        {channels.map((channel) => (
          <div
            key={channel}
            className="text-sm flex items-center gap-x-2 cursor-pointer rounded-md p-2 font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <span>#</span>
            {channel.name}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};

export default ChannelList;
