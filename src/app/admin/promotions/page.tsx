import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tag } from "lucide-react";

export default function PromotionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-3xl font-bold">Promotions & Offers</h1>
        <p className="text-muted-foreground">Create and manage discount codes and special offers.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Active Promotions</CardTitle>
          <CardDescription>This feature will be implemented soon.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed bg-transparent rounded-lg">
              <Tag className="h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">Promotion management tools will appear here.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
