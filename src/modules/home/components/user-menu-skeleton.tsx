import { Skeleton } from "@/components/ui/skeleton"

export function UserMenuSkeleton() {
  return (
    <div className="flex items-center gap-4">
      <Skeleton className="h-10 w-10 rounded-full" />
    </div>
  )
}

