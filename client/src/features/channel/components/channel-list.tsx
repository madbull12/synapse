import { ScrollArea } from "@/components/ui/scroll-area";
import { useParams } from "next/navigation";
import { useWorkspaceChannels } from "@/features/channel/hooks/queries/use-channel";
import Link from "next/link";

const ChannelList = () => {


  const { workspaceId } = useParams()

  const { data: channels } = useWorkspaceChannels(workspaceId as string);


  return (
    <ScrollArea>
      <div className="max-h-125">
        {channels.data.map((channel) => (
          <Link href={`/workspace/${workspaceId}/channel/${channel.name}`} key={channel.id}>
            <div

              className="text-sm flex items-center gap-x-2 cursor-pointer rounded-md p-2 font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <span>#</span>
              {channel.name}
            </div>
          </Link>

        ))}
      </div>
    </ScrollArea>
  );
};

export default ChannelList;
