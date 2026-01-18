'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Hotel, Users2, BookOpen, IndianRupee } from 'lucide-react';

function StatCard({ title, value, icon: Icon, description }: any) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-xs text-muted-foreground">{description}</p>
            </CardContent>
        </Card>
    )
}

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="font-headline text-3xl font-bold">Admin Dashboard</h1>
      <p className="text-muted-foreground">An overview of your OTA platform.</p>

      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Revenue" value="₹1,25,000" icon={IndianRupee} description="+20.1% from last month" />
        <StatCard title="Bookings" value="+2350" icon={BookOpen} description="+180.1% from last month" />
        <StatCard title="Hotels" value="57" icon={Hotel} description="Total active hotels" />
        <StatCard title="Users" value="+573" icon={Users2} description="Total registered users" />
      </div>

       <div className="mt-8">
            <Card>
                <CardHeader>
                    <CardTitle>Recent Bookings</CardTitle>
                    <CardDescription>An overview of the most recent bookings.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Recent bookings feature coming soon.</p>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
