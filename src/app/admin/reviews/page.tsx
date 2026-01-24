import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";

export default function ReviewsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-3xl font-bold">Review Moderation</h1>
        <p className="text-muted-foreground">Approve, edit, or delete customer reviews.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Pending Reviews</CardTitle>
          <CardDescription>This feature will be implemented soon.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed bg-transparent rounded-lg">
              <Star className="h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">The review management interface will appear here.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
