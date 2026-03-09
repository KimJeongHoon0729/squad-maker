import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Player, Team, TierConfig } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const TEAM_COLORS = [
  "#ff4757", "#00d4ff", "#00ff88", "#ffd700",
  "#ff6b35", "#c678dd", "#e06c75", "#56b6c2",
];

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

export function generateBalancedTeams(players: Player[], teamCount: number, tiers: TierConfig[]): Team[] {
  const teams: Team[] = Array.from({ length: teamCount }, (_, i) => ({
    id: `team-${i + 1}`,
    name: `팀 ${i + 1}`,
    players: [],
    color: TEAM_COLORS[i % TEAM_COLORS.length],
  }));

  const getTierScore = (label: string) =>
    tiers.find((t) => t.label === label)?.score ?? 1;

  const sorted = [...players].sort((a, b) => {
    const diff = getTierScore(b.tierId) - getTierScore(a.tierId);
    return diff !== 0 ? diff : Math.random() - 0.5;
  });

  const teamScores = new Array(teamCount).fill(0);

  sorted.forEach((player) => {
    // 현재 점수가 가장 낮은 팀에 배정
    const minScore = Math.min(...teamScores);
    const minIdx = teamScores.indexOf(minScore);
    teams[minIdx].players.push(player);
    teamScores[minIdx] += getTierScore(player.tierId);
  });

  return teams;
}

export function calculateTeamScore(team: Team, tiers: TierConfig[]): number {
  return team.players.reduce((sum, p) => {
    const tier = tiers.find((t) => t.label === p.tierId);
    return sum + (tier?.score ?? 0);
  }, 0);
}

export function calculateTeamAvgScore(team: Team, tiers: TierConfig[]): number {
  if (team.players.length === 0) return 0;
  return calculateTeamScore(team, tiers) / team.players.length;
}

export function calculateBalanceScore(teams: Team[], tiers: TierConfig[]): number {
  if (teams.length === 0) return 0;
  const scores = teams.map((t) => calculateTeamScore(t, tiers));
  return Math.max(...scores) - Math.min(...scores);
}

export function getTierDistribution(players: Player[], tiers: TierConfig[]): Record<string, number> {
  const dist: Record<string, number> = {};
  tiers.forEach((t) => (dist[t.label] = 0));
  players.forEach((p) => {
    if (dist[p.tierId] !== undefined) dist[p.tierId]++;
  });
  return dist;
}
