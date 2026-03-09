import { cn } from "@/lib/utils";
import { TierConfig } from "@/types";

interface TierBadgeProps {
  tier: TierConfig;
  size?: "sm" | "md" | "lg" | "xl";
  showLabel?: boolean;
  className?: string;
}

export function TierBadge({ tier, size = "md", showLabel = false, className }: TierBadgeProps) {
  const sizeClasses = {
    sm: "w-6 h-6 text-xs font-bold",
    md: "w-8 h-8 text-sm font-bold",
    lg: "w-10 h-10 text-base font-bold",
    xl: "w-14 h-14 text-xl font-black",
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className={cn("flex items-center justify-center rounded-sm text-white", sizeClasses[size])}
        style={{
          background: `linear-gradient(135deg, ${tier.color}, ${tier.color}cc)`,
          boxShadow: `0 0 8px ${tier.color}60`,
          fontFamily: "var(--font-dm-mono)",
        }}
      >
        {tier.label}
      </div>
      {showLabel && (
        <span className="text-muted-foreground text-sm">{tier.description}</span>
      )}
    </div>
  );
}
