import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';

export function BookingSuccessSkeleton() {
  return (
    <div className="bg-muted/40 min-h-[calc(100vh-4rem)] flex items-center">
      <div className="container mx-auto max-w-2xl py-12 px-4 md:px-6">
        <Card className="shadow-lg">
          <CardHeader className="items-center text-center bg-green-50/50 dark:bg-green-900/10 pt-8">
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
            <CardTitle className="text-3xl font-headline mt-4">Finalizing Confirmation...</CardTitle>
            <CardDescription className="max-w-md">
              <Skeleton className="h-4 w-3/4 mx-auto" />
              <Skeleton className="h-4 w-1/2 mx-auto mt-2" />
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <Card className="bg-background">
              <CardHeader>
                <Skeleton className="h-7 w-1/2" />
                <Skeleton className="h-4 w-1/3 mt-2" />
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <Skeleton className="h-5 w-2/5" />
                <Skeleton className="h-5 w-4/5" />
                <Skeleton className="h-5 w-4/5" />
                <Skeleton className="h-5 w-1/4" />
              </CardContent>
            </Card>

            <div className="rounded-lg border bg-background p-4 space-y-3">
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="flex justify-between items-center">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-6 w-24" />
              </div>
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-5 w-24" />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Skeleton className="h-11 w-full" />
              <Skeleton className="h-11 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
