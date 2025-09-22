import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function IncomePageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>

      {/* Search and Filters Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-24" />
          </div>
        </CardContent>
      </Card>

      {/* Income Table Skeleton */}
      <Card>
        <CardContent className="p-0">
          {/* Tabs Skeleton */}
          <div className="border-b">
            <div className="flex space-x-8 px-6">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-24" />
              ))}
            </div>
          </div>

          {/* Table Skeleton */}
          <div className="p-6">
            <div className="space-y-4">
              {/* Table Header */}
              <div className="grid grid-cols-8 gap-4">
                {[...Array(8)].map((_, i) => (
                  <Skeleton key={i} className="h-4 w-full" />
                ))}
              </div>

              {/* Table Rows */}
              {[...Array(5)].map((_, i) => (
                <div key={i} className="grid grid-cols-8 gap-4 py-2">
                  {[...Array(8)].map((_, j) => (
                    <Skeleton key={j} className="h-4 w-full" />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
