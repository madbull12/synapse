"use server"

import { WorkspaceDTO, WorkspaceResponse } from "@/features/workspace/types/api";
import { cookies } from "next/headers";
import { cache } from "react";

export const fetchUserWorkspaces = cache(async (): Promise<WorkspaceDTO[] | null> => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/workspaces`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    if (!res.ok) return null;

    const json: WorkspaceResponse = await res.json();

    return json.data;
  } catch (error) {
    console.error("Failed to fetch user workspaces:", error);
    return null;
  }
});
