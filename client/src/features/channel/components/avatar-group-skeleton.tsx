import { Skeleton } from "@/components/ui/skeleton";

export function AvatarGroupSkeleton() {
    return (
        <div className="flex items-center">
            <Skeleton className="w-7 h-7 rounded-full border-2 border-background" />
            <Skeleton className="w-7 h-7 rounded-full border-2 border-background -ml-2" />
            <Skeleton className="w-7 h-7 rounded-full border-2 border-background -ml-2" />
        </div>
    );
}