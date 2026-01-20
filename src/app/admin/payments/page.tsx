import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Receipt } from "lucide-react";

export default function PaymentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-3xl font-bold">Payment Management</h1>
        <p className="text-muted-foreground">View and manage all transactions and refunds.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Transactions</CardTitle>
          <CardDescription>This feature will be implemented soon.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed bg-transparent rounded-lg">
              <Receipt className="h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">The transaction list will appear here.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
