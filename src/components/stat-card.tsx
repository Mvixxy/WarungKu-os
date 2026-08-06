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
        tone === "accent" && "border-accent/25 bg-accent/8",
        tone === "warn" && "border-primary/20 bg-primary/5"
      )}
    >
      <CardContent className="space-y-1.5 p-4">
        <div className="flex items-center justify-between">
          <p className={cn(
            "text-[10px] font-medium uppercase tracking-wider",
            tone === "accent" && "text-accent",
            tone === "warn" && "text-primary",
            tone === "default" && "text-muted-foreground"
          )}>{title}</p>
          <ArrowUpRight className={cn(
            "size-3",
            tone === "accent" && "text-accent",
            tone === "warn" && "text-primary",
            tone === "default" && "text-muted-foreground"
          )} />
        </div>
        <p className={cn(
          "font-heading text-2xl font-semibold tracking-tight",
          tone === "accent" && "text-accent-foreground dark:text-accent",
          tone === "warn" && "text-primary"
        )}>{value}</p>
        <p className="text-[11px] text-muted-foreground leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  );
}
