import { cookies } from "next/headers";
import { cache } from "react";

export const fetchUserWorkspaces = cache(async () => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/workspaces`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (!res.ok) return [];
  const json = await res.json();
  return json.data; // Returns the array of workspaces
});
