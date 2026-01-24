import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function BookingFormSkeleton() {
  return (
    <div className="container mx-auto max-w-4xl py-8 md:py-12 px-4 md:px-6">
       <Skeleton className="h-6 w-32 mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        <div className="space-y-6">
          <Skeleton className="h-9 w-3/4" />
          <Card>
            <CardHeader>
              <Skeleton className="h-7 w-1/2" />
              <Skeleton className="h-4 w-1/3 mt-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="w-full aspect-video rounded-lg mb-4" />
              <div className="space-y-3">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-1/3" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
            <Skeleton className="h-9 w-3/4" />
             <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-1/2" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-1/2" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between">
                        <Skeleton className="h-5 w-2/3" />
                        <Skeleton className="h-5 w-1/4" />
                    </div>
                     <div className="border-t pt-2 mt-2 flex justify-between">
                        <Skeleton className="h-6 w-1/3" />
                        <Skeleton className="h-6 w-1/4" />
                    </div>
                </CardContent>
            </Card>
             <Skeleton className="h-14 w-full" />
        </div>
      </div>
    </div>
  );
}
