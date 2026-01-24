import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="container mx-auto max-w-7xl py-8 px-4 md:px-6">
      <section className="mb-8">
        <Skeleton className="h-12 w-3/4" />
        <div className="mt-4 flex items-center gap-4">
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-6 w-16" />
        </div>
      </section>

      <section className="mb-12">
        <Skeleton className="h-[500px] w-full rounded-lg" />
      </section>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <section className="mb-8 space-y-4">
            <Skeleton className="h-10 w-1/2" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-5/6" />
          </section>

          <div className="my-8 h-px bg-border" />

          <section>
            <Skeleton className="h-10 w-1/3 mb-6" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-6 w-6 rounded" />
                  <Skeleton className="h-5 w-20" />
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24 border rounded-lg p-4 space-y-4">
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-4 w-3/4" />
            <div className="space-y-4 pt-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
