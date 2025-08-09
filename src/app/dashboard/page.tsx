import { StatCard } from "@/components/dashboard/stat-card";
import { AnalyticsChart } from "@/components/dashboard/analytics-chart";
import { InsightsCard } from "@/components/dashboard/insights-card";
import { Users, Mail, BarChart, CheckCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function DashboardPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 bg-background">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground">
            Welcome, User
          </h1>
          <p className="text-muted-foreground">Here's the latest on your campaigns.</p>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <StatCard 
          title="Total Subscribers"
          value="12,405"
          description="+20.1% from last month"
          Icon={Users}
          color="from-primary to-purple-400"
        />
        <StatCard 
          title="Emails Sent"
          value="72,130"
          description="In the last 30 days"
          Icon={Mail}
          color="from-sky-500 to-accent"
        />
        <StatCard 
          title="Avg. Open Rate"
          value="24.5%"
          description="+2.1% from last month"
          Icon={BarChart}
          color="from-orange-500 to-amber-400"
        />
        <StatCard 
          title="Avg. Click Rate"
          value="4.2%"
          description="+0.5% from last month"
          Icon={CheckCircle}
          color="from-green-500 to-emerald-400"
        />
      </div>

      <Separator className="my-4"/>

      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <div className="lg:col-span-1 xl:col-span-2">
            <AnalyticsChart />
        </div>
        <div className="lg:col-span-1">
            <InsightsCard />
        </div>
      </div>
    </main>
  );
}
