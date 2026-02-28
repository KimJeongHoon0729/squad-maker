export type Tier = "S" | "A" | "B" | "C" | "D";

export interface Player {
  id: string;
  name: string;
  tier: Tier;
  createdAt: number;
}

export interface Team {
  id: string;
  name: string;
  players: Player[];
  color: string;
}

export interface TeamGenerationConfig {
  mode: "random" | "balanced";
  teamCount: number;
  players: Player[];
}

export const TIER_CONFIG: Record<
  Tier,
  { label: string; color: string; bgClass: string; score: number; description: string }
> = {
  S: {
    label: "S",
    color: "#ff4757",
    bgClass: "tier-s",
    score: 5,
    description: "최상급",
  },
  A: {
    label: "A",
    color: "#ff6b35",
    bgClass: "tier-a",
    score: 4,
    description: "상급",
  },
  B: {
    label: "B",
    color: "#ffd700",
    bgClass: "tier-b",
    score: 3,
    description: "중상급",
  },
  C: {
    label: "C",
    color: "#00d4ff",
    bgClass: "tier-c",
    score: 2,
    description: "중급",
  },
  D: {
    label: "D",
    color: "#a8b2d8",
    bgClass: "tier-d",
    score: 1,
    description: "입문",
  },
};
