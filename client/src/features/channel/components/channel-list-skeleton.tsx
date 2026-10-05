import { Skeleton } from "@/components/ui/skeleton";

export function ChannelListSkeleton() {
  return (
    <div className="space-y-1 px-2 py-2">
      <div className="flex items-center justify-between px-2 pb-1">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="size-3 rounded-full" />
      </div>

      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="flex items-center gap-2.5 rounded-lg px-2.5 py-2"
        >
          <Skeleton className="size-4 rounded" />

          <Skeleton
            className="h-3.5"
            style={{ width: `${Math.floor(Math.random() * 40) + 40}%` }}
          />
        </div>
      ))}
    </div>
  );
}
