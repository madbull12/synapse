import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export function AppSidebarSkeleton() {
  return (
    <div className="flex h-full w-full overflow-hidden border-r bg-sidebar">
      {/* Left Workspace Rail Skeleton */}
      <div className="flex flex-col items-center py-3 px-2 gap-y-2 shrink-0 border-r border-border/40 w-14 bg-sidebar">
        <Skeleton className="size-9 rounded-xl" />
        <Skeleton className="size-9 rounded-xl" />
        <Skeleton className="size-9 rounded-xl" />
      </div>

      {/* Right Sidebar Content Pane Skeleton */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-sidebar">
        {/* Workspace Dropdown Header Skeleton */}
        <div className="p-2">
          <div className="flex items-center justify-between p-2 rounded-md border border-border/40 bg-muted/20">
            <div className="flex items-center gap-x-2.5">
              <Skeleton className="size-7 rounded-md" />
              <div className="space-y-1">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-2.5 w-12" />
              </div>
            </div>
            <Skeleton className="size-4 rounded" />
          </div>
        </div>

        <Separator className="opacity-60" />

        {/* Content Area Skeleton */}
        <div className="flex-1 px-2 py-3 space-y-4 overflow-hidden">
          {/* Channels Section Skeleton */}
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2">
              <div className="flex items-center gap-x-2">
                <Skeleton className="size-3.5 rounded" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="size-4 rounded" />
            </div>
            <div className="pl-5 space-y-1.5">
              <Skeleton className="h-7 w-full rounded-md" />
              <Skeleton className="h-7 w-full rounded-md" />
              <Skeleton className="h-7 w-3/4 rounded-md" />
            </div>
          </div>

          {/* Direct Messages Section Skeleton */}
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2">
              <div className="flex items-center gap-x-2">
                <Skeleton className="size-3.5 rounded" />
                <Skeleton className="h-3 w-28" />
              </div>
            </div>
            <div className="pl-5 space-y-2 pt-1">
              <div className="flex items-center gap-x-2.5">
                <Skeleton className="size-6 rounded-full" />
                <Skeleton className="h-3 w-24" />
              </div>
              <div className="flex items-center gap-x-2.5">
                <Skeleton className="size-6 rounded-full" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          </div>
        </div>

        {/* User Footer Dropdown Skeleton */}
        <div className="mt-auto p-2 border-t border-border/40">
          <div className="flex items-center gap-x-2 p-2">
            <Skeleton className="size-8 rounded-full" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-2.5 w-16" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
