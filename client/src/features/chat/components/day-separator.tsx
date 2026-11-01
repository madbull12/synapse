export function DaySeparator({ label }: { label: string }) {
  return (
    <div className="relative flex items-center justify-center my-2">
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t" />
      </div>
      <span className="relative bg-background px-3 text-xs text-muted-foreground font-medium">
        {label}
      </span>
    </div>
  );
}
