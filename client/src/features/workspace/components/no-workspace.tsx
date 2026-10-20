"use client";

import { Button } from "@/components/ui/button";
import CreateWorkspaceModal from "@/features/workspace/components/create-workspace-modal";
import { FolderPlus, Plus } from "lucide-react";

const NoWorkspace = () => {
  return (
    <div className="flex-1 flex items-center justify-center p-6 min-h-[70vh]">
      <div className="max-w-md w-full text-center space-y-6 p-8 rounded-2xl border bg-card/50 shadow-sm backdrop-blur-sm relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        {/* Icon Badge */}
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-8 ring-primary/5 shadow-inner">
          <FolderPlus className="h-6 w-6" />
        </div>

        {/* Heading & Copy */}
        <div className="space-y-2">
          <h2 className="text-xl font-semibold tracking-tight">
            No Workspaces Yet
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            You haven't joined or created any workspaces yet. Get started by
            creating your first one below.
          </p>
        </div>

        {/* Action Button */}
        <CreateWorkspaceModal>
          <Button className="w-full sm:w-auto gap-2 shadow-sm">
            <Plus className="h-4 w-4" />
            Create Workspace
          </Button>
        </CreateWorkspaceModal>
      </div>
    </div>
  );
};

export default NoWorkspace;
