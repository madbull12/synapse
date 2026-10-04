import ChatPanel from "@/features/chat/components/chat-panel";
import ChannelHeader from "@/features/channel/components/channel-header";

const ChannelDashboard = () => {
  return (
    <main>
      <ChannelHeader />
      <ChatPanel />
    </main>
  );
};

export default ChannelDashboard;
