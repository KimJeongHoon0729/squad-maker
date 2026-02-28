"use client";

import { Team } from "@/types";
import { TierBadge } from "@/components/TierBadge";
import { calculateTeamScore, calculateTeamAvgScore } from "@/lib/utils";
import { TIER_CONFIG, Tier } from "@/types";
import { cn } from "@/lib/utils";
import { Shield } from "lucide-react";

interface TeamResultCardProps {
  team: Team;
  index: number;
  totalTeams: number;
  maxScore: number;
}

export function TeamResultCard({ team, index, totalTeams, maxScore }: TeamResultCardProps) {
  const score = calculateTeamScore(team);
  const avgScore = calculateTeamAvgScore(team);
  const scorePercent = maxScore > 0 ? (score / maxScore) * 100 : 0;

  return (
    <div
      className={cn(
        "team-card rounded-xl border overflow-hidden transition-all duration-500",
        "animate-fade-in-up"
      )}
      style={{
        animationDelay: `${index * 100}ms`,
        animationFillMode: "both",
        borderColor: `${team.color}30`,
        background: `linear-gradient(135deg, hsl(240 8% 9%) 0%, hsl(240 8% 7%) 100%)`,
      }}
    >
      {/* 팀 헤더 */}
      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{ background: `${team.color}10`, borderBottom: `1px solid ${team.color}20` }}
      >
        <div className="flex items-center gap-2">
          <Shield size={16} style={{ color: team.color }} />
          <span
            className="font-black text-base uppercase tracking-widest"
            style={{ color: team.color, fontFamily: "var(--font-rajdhani)" }}
          >
            {team.name}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div
              className="text-xs text-muted-foreground/60 uppercase tracking-widest"
              style={{ fontFamily: "var(--font-dm-mono)" }}
            >
              SCORE
            </div>
            <div
              className="text-sm font-bold"
              style={{ color: team.color, fontFamily: "var(--font-dm-mono)" }}
            >
              {score}
            </div>
          </div>
        </div>
      </div>

      {/* 점수 바 */}
      <div className="px-4 pt-2 pb-1">
        <div className="h-1 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{
              width: `${scorePercent}%`,
              background: `linear-gradient(90deg, ${team.color}80, ${team.color})`,
              boxShadow: `0 0 8px ${team.color}50`,
              transitionDelay: `${index * 100 + 300}ms`,
            }}
          />
        </div>
      </div>

      {/* 플레이어 목록 */}
      <div className="px-4 pb-4 pt-2 space-y-2">
        {team.players.map((player, pIdx) => (
          <div
            key={player.id}
            className="flex items-center gap-2 py-1.5 px-2 rounded-lg bg-secondary/30 animate-fade-in-up"
            style={{ animationDelay: `${index * 100 + pIdx * 50 + 200}ms`, animationFillMode: "both" }}
          >
            <TierBadge tier={player.tier} size="sm" />
            <span
              className="text-sm font-semibold flex-1 text-foreground/90"
              style={{ fontFamily: "var(--font-rajdhani)" }}
            >
              {player.name}
            </span>
            <span
              className="text-xs text-muted-foreground/50"
              style={{ fontFamily: "var(--font-dm-mono)" }}
            >
              +{TIER_CONFIG[player.tier].score}
            </span>
          </div>
        ))}

        {team.players.length === 0 && (
          <div className="text-center py-4 text-muted-foreground/30 text-sm">
            플레이어 없음
          </div>
        )}
      </div>

      {/* 푸터: 팀원 수 / 평균 티어 */}
      <div
        className="px-4 py-2 flex items-center justify-between border-t"
        style={{ borderColor: `${team.color}15` }}
      >
        <span
          className="text-xs text-muted-foreground/50"
          style={{ fontFamily: "var(--font-dm-mono)" }}
        >
          {team.players.length}명
        </span>
        <span
          className="text-xs text-muted-foreground/50"
          style={{ fontFamily: "var(--font-dm-mono)" }}
        >
          AVG {avgScore.toFixed(1)}
        </span>
      </div>
    </div>
  );
}
