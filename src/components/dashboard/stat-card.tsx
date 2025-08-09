import { type LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatCardProps = {
  title: string;
  value: string;
  description: string;
  Icon: LucideIcon;
  color: string;
};

export function StatCard({ title, value, description, Icon, color }: StatCardProps) {
  return (
    <Card className="relative overflow-hidden bg-card/80 backdrop-blur-sm border-border/50 shadow-lg transition-all hover:shadow-xl hover:-translate-y-1">
      <div className={cn("absolute top-0 left-0 h-1 w-full bg-gradient-to-r", color)} />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
