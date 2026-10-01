"use client";

import { useParams } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { WorkspaceGeneralForm } from "@/features/workspace/components/workpace-general-form";
import { WorkspaceDangerZone } from "@/features/workspace/components/workspace-danger-zone";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";


export default function GeneralSettingsClient() {
    const params = useParams();
    const workspaceId = (params?.workspaceId as string) || "";

    // Mock initial data fetched from API
    const initialData = {
        name: "Acme Corp",
        slug: "acme-corp",
    };

    return (
        <div className="space-y-8 p-6 md:p-8">
            <header className="flex items-center gap-4">
                <Link href={`/workspace/${workspaceId}`}>
                    <ChevronLeft />
                </Link>
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground">Settings</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Manage your workspace&apos;s core identity, URL handle, and general preferences.
                    </p>
                </div>
            </header>


            <Separator />

            <WorkspaceGeneralForm workspaceId={workspaceId} initialData={initialData} />

            <Separator />

            <WorkspaceDangerZone workspaceId={workspaceId} />
        </div>
    );
}