"use client";

import { Button } from "@/components/ui/button";

const NoWorkspace = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
      <h2 className="text-2xl font-bold tracking-tight mb-2">
        No Workspaces Yet
      </h2>
      <p className="text-muted-foreground mb-6">
        You haven't joined or created any workspaces. Get started by creating
        your first one below.
      </p>
      <Button>Create Workspace</Button>
    </div>
  );
};

export default NoWorkspace;
