import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart } from "lucide-react";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-3xl font-bold">Analytics & Reports</h1>
        <p className="text-muted-foreground">Gain insights into your platform's performance.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Key Metrics</CardTitle>
          <CardDescription>This feature will be implemented soon.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed bg-transparent rounded-lg">
              <BarChart className="h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">Detailed charts and downloadable reports will appear here.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
