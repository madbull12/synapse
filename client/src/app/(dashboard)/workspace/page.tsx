import { Button } from "@/components/ui/button";
import { fetchUserWorkspaces } from "@/features/user/service/server";
import { redirect } from "next/navigation";

const WorkspacePage = async () => {
  const workspaces = await fetchUserWorkspaces();

  if (workspaces && workspaces.length > 0) {
    redirect(`/workspace/${workspaces[0].id}`);
  }
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
      <h2 className="text-2xl font-bold tracking-tight mb-2">
        No Workspaces Yet
      </h2>
      <p className="text-muted-foreground mb-6">
        You haven't joined or created any workspaces. Get started by creating
        your first one below.
      </p>
      <Button onClick={() => {}}>Create Workspace</Button>
    </div>
  );
};

export default WorkspacePage;
