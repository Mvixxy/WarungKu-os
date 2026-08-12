"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

type Mode = "light" | "dark";
type Variant = "sidebar" | "default";

const options: { value: Mode; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Terang", icon: Sun },
  { value: "dark", label: "Gelap", icon: Moon },
];

const styles: Record<Variant, { container: string; active: string; inactive: string }> = {
  sidebar: {
    container: "border-sidebar-border bg-sidebar-accent",
    active: "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm",
    inactive: "text-sidebar-foreground/50 hover:bg-sidebar-accent hover:text-sidebar-foreground",
  },
  default: {
    container: "border-border bg-muted",
    active: "bg-primary text-primary-foreground shadow-sm",
    inactive: "text-muted-foreground hover:bg-card hover:text-foreground",
  },
};

export function ThemeToggle({
  className,
  variant = "sidebar",
}: {
  className?: string;
  variant?: Variant;
}) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true); // eslint-disable-line react-hooks/set-state-in-effect
  }, []);

  const active = (mounted ? theme : undefined) as Mode | undefined;
  const tokens = styles[variant];

  return (
    <div
      role="radiogroup"
      aria-label="Mode tampilan"
      className={cn(
        "inline-flex items-center gap-0.5 rounded-lg border p-0.5",
        tokens.container,
        className,
      )}
    >
      {options.map((option) => {
        const Icon = option.icon;
        const isActive = active === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            aria-label={option.label}
            title={option.label}
            onClick={() => setTheme(option.value)}
            className={cn(
              "flex size-7 items-center justify-center rounded-md transition-colors",
              isActive ? tokens.active : tokens.inactive,
            )}
          >
            <Icon className="size-3.5" />
          </button>
        );
      })}
    </div>
  );
}
