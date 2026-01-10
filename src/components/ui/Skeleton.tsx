import { clsx } from 'clsx'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={clsx(
        'animate-pulse rounded-md bg-accent-200 dark:bg-accent-700',
        className
      )}
    />
  )
}

export function SkeletonText({ className }: SkeletonProps) {
  return <Skeleton className={clsx('h-4 w-full', className)} />
}

export function SkeletonCard() {
  return (
    <div className="rounded-lg border border-accent-200 bg-paper p-5 dark:border-accent-700 dark:bg-paper-dark">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-5 w-48" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  )
}

export function SkeletonReportCheckbox() {
  return (
    <div className="flex min-h-[56px] items-center gap-4 rounded-md border border-accent-200 p-4 dark:border-accent-700 sm:min-h-0 sm:gap-3 sm:p-3">
      <Skeleton className="h-5 w-5 rounded sm:h-4 sm:w-4" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
  )
}
