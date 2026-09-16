import ChatPanel from "@/features/chat/components/chat-panel";
import { cookies } from "next/headers";

const fetchWorkspaces = async () => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;
  console.log("Access Token from cookies:", accessToken);
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/workspaces`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });
  console.log("Response from /workspaces:", res);
  if (!res.ok) return null;
  const json = await res.json();
  return json.data;
};

const WorkspacePage = async () => {
  const workspace = await fetchWorkspaces();
  return (
    <div>
      <h1>Workspace Details</h1>
      <pre>{JSON.stringify(workspace, null, 2)}</pre>
    </div>
  );
};

export default WorkspacePage;
