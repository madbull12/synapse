import GeneralSettingsClient from "@/features/workspace/components/general-settings-client";
import type { Metadata } from "next";

// Static or dynamic metadata export
export const metadata: Metadata = {
    title: "General Settings | Workspace",
    description: "Manage your workspace's core identity, URL handle, and general preferences.",
};

export default function GeneralSettingsPage() {
    return <GeneralSettingsClient />;
}