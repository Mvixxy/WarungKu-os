import { ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  description: string;
  tone?: "default" | "accent" | "warn";
}

export function StatCard({
  title,
  value,
  description,
  tone = "default",
}: StatCardProps) {
  return (
    <Card
      className={cn(
        "border-border bg-card",
        tone === "accent" && "bg-accent text-accent-foreground border-accent/30",
        tone === "warn" && "bg-primary/8 text-primary border-primary/20"
      )}
    >
      <CardContent className="space-y-2 p-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
          <ArrowUpRight className="size-3.5 text-muted-foreground" />
        </div>
        <p className="font-heading text-2xl font-semibold tracking-tight">{value}</p>
        <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  );
}
