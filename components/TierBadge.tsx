import { cn } from "@/lib/utils";
import { Tier, TIER_CONFIG } from "@/types";

interface TierBadgeProps {
  tier: Tier;
  size?: "sm" | "md" | "lg" | "xl";
  showLabel?: boolean;
  className?: string;
}

export function TierBadge({ tier, size = "md", showLabel = false, className }: TierBadgeProps) {
  const config = TIER_CONFIG[tier];

  const sizeClasses = {
    sm: "w-6 h-6 text-xs font-bold",
    md: "w-8 h-8 text-sm font-bold",
    lg: "w-10 h-10 text-base font-bold",
    xl: "w-14 h-14 text-xl font-black",
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className={cn(
          "flex items-center justify-center rounded-sm",
          config.bgClass,
          sizeClasses[size]
        )}
        style={{ fontFamily: "var(--font-dm-mono)" }}
      >
        {tier}
      </div>
      {showLabel && (
        <span className="text-muted-foreground text-sm">{config.description}</span>
      )}
    </div>
  );
}
