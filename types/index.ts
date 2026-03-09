// 동적 티어 타입 (DB 기반)
export interface TierConfig {
  id: string;
  label: string;
  description: string;
  color: string;
  score: number;
  order: number;
}

export interface Player {
  id: string;
  name: string;
  tierId: string;   // tier label (e.g. "S", "A", "커스텀")
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

// 하위 호환용 - 기존 코드에서 tier string으로 쓰는 곳 대응
export type Tier = string;

// 기본 티어 (DB 로딩 전 fallback)
export const DEFAULT_TIERS: TierConfig[] = [
  { id: "default-s", label: "S", description: "최상급", color: "#ff4757", score: 5, order: 1 },
  { id: "default-a", label: "A", description: "상급",   color: "#ff6b35", score: 4, order: 2 },
  { id: "default-b", label: "B", description: "중상급", color: "#ffd700", score: 3, order: 3 },
  { id: "default-c", label: "C", description: "중급",   color: "#00d4ff", score: 2, order: 4 },
  { id: "default-d", label: "D", description: "입문",   color: "#a8b2d8", score: 1, order: 5 },
];
