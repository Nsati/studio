import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-3xl font-bold">Website Settings</h1>
        <p className="text-muted-foreground">Manage global settings for the platform.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>This feature will be implemented soon.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed bg-transparent rounded-lg">
              <Settings className="h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">Platform configuration options will appear here.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
