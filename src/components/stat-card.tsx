import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  description: string;
  tone?: "default" | "accent" | "warn";
  href?: string;
  className?: string;
  hint?: string;
  onClick?: () => void;
}

export function StatCard({
  title,
  value,
  description,
  tone = "default",
  href,
  className,
  hint,
  onClick,
}: StatCardProps) {
  const content = (
    <CardContent className="space-y-1 p-3 sm:space-y-1.5 sm:p-4">
      <div className="flex items-center justify-between">
        <p className={cn(
          "text-[8px] font-medium uppercase tracking-wider sm:text-[10px]",
          tone === "accent" && "text-accent",
          tone === "warn" && "text-primary",
          tone === "default" && "text-muted-foreground"
        )}>{title}</p>
        <ArrowUpRight className={cn(
          "size-2.5 sm:size-3",
          tone === "accent" && "text-accent",
          tone === "warn" && "text-primary",
          tone === "default" && "text-muted-foreground"
        )} />
      </div>
      <p className={cn(
        "font-heading text-base font-semibold tracking-tight sm:text-2xl",
        tone === "accent" && "text-accent-foreground dark:text-accent",
        tone === "warn" && "text-primary"
      )}>{value}</p>
      <p className="text-[9px] text-muted-foreground leading-snug sm:text-[11px]">{description}</p>
    </CardContent>
  );

  if (href) {
    return (
      <Link href={href}>
        <Card className={cn(
          "border-border bg-card transition-colors hover:border-primary/30",
          tone === "accent" && "border-accent/25 bg-accent/8",
          tone === "warn" && "border-primary/20 bg-primary/5"
        )}>
          {content}
        </Card>
      </Link>
    );
  }

  return (
    <Card
      {...(onClick ? { onClick, role: "button", tabIndex: 0, onKeyDown: (e: React.KeyboardEvent) => { if (e.key === "Enter" || e.key === " ") onClick(); } } : {})}
      className={cn(
        "border-border bg-card",
        onClick && "cursor-pointer transition-colors hover:bg-muted/30",
        tone === "accent" && "border-accent/25 bg-accent/8",
        tone === "warn" && "border-primary/20 bg-primary/5"
      )}
    >
      {content}
    </Card>
  );
}
