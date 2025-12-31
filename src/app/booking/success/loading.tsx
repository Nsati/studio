
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

export default function Loading() {
    return (
        <div className="container mx-auto max-w-3xl py-12 px-4 md:px-6">
            <Card className="shadow-lg">
                <CardContent className="p-6 sm:p-8">
                    <div className="flex flex-col items-center text-center">
                        <Skeleton className="h-20 w-20 rounded-full bg-muted" />
                        <Skeleton className="mt-6 h-10 w-3/4" />
                        <Skeleton className="mt-4 h-5 w-1/2" />
                        <Skeleton className="mt-2 h-5 w-full" />
                    </div>

                    <div className="mt-8 border-t border-dashed pt-8">
                        <div className="space-y-6">
                            <div className="flex justify-between">
                                <Skeleton className="h-5 w-1/4" />
                                <Skeleton className="h-5 w-1/2" />
                            </div>
                            <div className="flex justify-between">
                                <Skeleton className="h-5 w-1/4" />
                                <Skeleton className="h-5 w-1/3" />
                            </div>
                            <div className="flex justify-between">
                                <Skeleton className="h-5 w-1/4" />
                                <Skeleton className="h-5 w-1/4" />
                            </div>
                            <div className="flex justify-between">
                                <Skeleton className="h-5 w-1/4" />
                                <Skeleton className="h-5 w-1/3" />
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                        <Skeleton className="h-12 w-full sm:w-48" />
                        <Skeleton className="h-12 w-full sm:w-48" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
