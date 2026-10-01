"use client";

import * as React from "react";
import { Loader2, AlertTriangle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface WorkspaceDangerZoneProps {
    workspaceId: string;
}

export function WorkspaceDangerZone({ workspaceId }: WorkspaceDangerZoneProps) {
    const [isDeleting, setIsDeleting] = React.useState(false);

    const handleDeleteWorkspace = async () => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this workspace? This action cannot be undone."
        );
        if (!confirmed) return;

        try {
            setIsDeleting(true);
            console.log("Deleting workspace:", workspaceId);
            toast.success("Workspace deleted permanently.");
        } catch (error) {
            toast.error("Failed to delete workspace.");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 space-y-4">
            <div className="flex items-center gap-2 text-destructive font-semibold text-sm">
                <AlertTriangle className="size-4" />
                Danger Zone
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
                Deleting a workspace is permanent and immediate. All associated channels, files, messages, and member access permissions will be unrecoverable. Please proceed with extreme caution.
            </p>
            <div className="flex justify-end pt-2">
                <Button
                    variant="destructive"
                    size="sm"
                    disabled={isDeleting}
                    onClick={handleDeleteWorkspace}
                    className="gap-2"
                >
                    {isDeleting ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                    Delete Workspace
                </Button>
            </div>
        </div>
    );
}