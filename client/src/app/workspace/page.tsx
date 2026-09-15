import ChatPanel from "@/features/chat/components/chat-panel";

const fetchWorkspaces = async (workspaceId: string) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/workspaces`, {});
};

const WorkspacePage = () => {
  return <></>;
};

export default WorkspacePage;
