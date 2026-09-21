import { Button } from "@/components/ui/button";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const fetchWorkspaces = async () => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/workspaces`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });
  if (!res.ok) return null;
  const json = await res.json();
  return json.data;
};

const WorkspacePage = async () => {
  const workspaces = await fetchWorkspaces();

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
