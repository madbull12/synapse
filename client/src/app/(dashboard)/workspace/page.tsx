import { Button } from "@/components/ui/button";
import { fetchUserWorkspaces } from "@/features/user/service/server";
import NoWorkspace from "@/features/workspace/components/no-workspace";
import { redirect } from "next/navigation";

const WorkspacePage = async () => {
  const workspaces = await fetchUserWorkspaces();

  if (workspaces && workspaces.length > 0) {
    redirect(`/workspace/${workspaces[0].id}`);
  }
  return <NoWorkspace />;
};

export default WorkspacePage;
