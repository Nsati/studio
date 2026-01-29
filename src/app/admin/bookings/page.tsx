import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen } from "lucide-react";

export default function BookingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-3xl font-bold">Booking Management</h1>
        <p className="text-muted-foreground">View and manage all bookings.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Bookings</CardTitle>
          <CardDescription>This feature is not currently implemented.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed bg-transparent rounded-lg">
              <BookOpen className="h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">The booking list will appear here.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
