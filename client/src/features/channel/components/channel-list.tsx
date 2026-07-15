import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const ChannelList = () => {
  const channels = [
    "general",
    "product-design",
    "frontend",
    "backend",
    "marketing",
    "sales",
    "support",
    "random",
  ];

  return (
    <ScrollArea>
      <div className="max-h-[500px]">
        {channels.map((channel) => (
          <div
            key={channel}
            className="text-sm flex items-center gap-x-2 cursor-pointer rounded-md p-2 font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <span>#</span>
            {channel}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};

export default ChannelList;
