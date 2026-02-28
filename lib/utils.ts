import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Player, Team, Tier, TIER_CONFIG } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 팀 색상 팔레트
const TEAM_COLORS = [
  "#ff4757", // 레드
  "#00d4ff", // 블루
  "#00ff88", // 그린
  "#ffd700", // 옐로
  "#ff6b35", // 오렌지
  "#c678dd", // 퍼플
  "#e06c75", // 핑크
  "#56b6c2", // 시안
];

/**
 * 완전 랜덤 팀 배분
 */
export function generateRandomTeams(players: Player[], teamCount: number): Team[] {
  const shuffled = [...players].sort(() => Math.random() - 0.5);
  const teams: Team[] = Array.from({ length: teamCount }, (_, i) => ({
    id: `team-${i + 1}`,
    name: `팀 ${i + 1}`,
    players: [],
    color: TEAM_COLORS[i % TEAM_COLORS.length],
  }));

  shuffled.forEach((player, idx) => {
    teams[idx % teamCount].players.push(player);
  });

  return teams;
}

/**
 * 밸런스 팀 배분 (티어 기반 최적화)
 * 스네이크 드래프트 방식으로 배분해서 각 팀의 총 점수를 균등하게 맞춤
 */
export function generateBalancedTeams(players: Player[], teamCount: number): Team[] {
  const teams: Team[] = Array.from({ length: teamCount }, (_, i) => ({
    id: `team-${i + 1}`,
    name: `팀 ${i + 1}`,
    players: [],
    color: TEAM_COLORS[i % TEAM_COLORS.length],
  }));

  // 티어 점수 기준 내림차순 정렬 후, 같은 티어 내에서는 랜덤
  const sorted = [...players].sort((a, b) => {
    const scoreDiff = TIER_CONFIG[b.tier].score - TIER_CONFIG[a.tier].score;
    if (scoreDiff !== 0) return scoreDiff;
    return Math.random() - 0.5;
  });

  // 스네이크 드래프트: 1,2,3 → 3,2,1 → 1,2,3 ...
  const teamScores = new Array(teamCount).fill(0);

  sorted.forEach((player, idx) => {
    const round = Math.floor(idx / teamCount);
    let teamIdx: number;

    if (round % 2 === 0) {
      teamIdx = idx % teamCount;
    } else {
      teamIdx = teamCount - 1 - (idx % teamCount);
    }

    // 현재 라운드에서 점수가 가장 낮은 팀에 배분 (추가 최적화)
    if (idx >= teamCount) {
      const minScore = Math.min(...teamScores);
      const candidates = teams
        .map((_, i) => i)
        .filter((i) => teamScores[i] === minScore && teams[i].players.length <= Math.floor(sorted.length / teamCount) + 1);

      if (candidates.length > 0) {
        teamIdx = candidates[Math.floor(Math.random() * candidates.length)];
      }
    }

    teams[teamIdx].players.push(player);
    teamScores[teamIdx] += TIER_CONFIG[player.tier].score;
  });

  return teams;
}

/**
 * 팀 총 점수 계산
 */
export function calculateTeamScore(team: Team): number {
  return team.players.reduce((sum, p) => sum + TIER_CONFIG[p.tier].score, 0);
}

/**
 * 팀 평균 점수 계산
 */
export function calculateTeamAvgScore(team: Team): number {
  if (team.players.length === 0) return 0;
  return calculateTeamScore(team) / team.players.length;
}

/**
 * 밸런스 점수 (팀 간 최대-최소 점수 차이, 낮을수록 좋음)
 */
export function calculateBalanceScore(teams: Team[]): number {
  if (teams.length === 0) return 0;
  const scores = teams.map(calculateTeamScore);
  return Math.max(...scores) - Math.min(...scores);
}

/**
 * 티어별 플레이어 수 집계
 */
export function getTierDistribution(players: Player[]): Record<Tier, number> {
  const dist: Record<Tier, number> = { S: 0, A: 0, B: 0, C: 0, D: 0 };
  players.forEach((p) => dist[p.tier]++);
  return dist;
}

/**
 * localStorage 헬퍼
 */
export const storage = {
  getPlayers: (): Player[] => {
    if (typeof window === "undefined") return [];
    try {
      const data = localStorage.getItem("team-maker-players");
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  setPlayers: (players: Player[]) => {
    if (typeof window === "undefined") return;
    localStorage.setItem("team-maker-players", JSON.stringify(players));
  },
};
