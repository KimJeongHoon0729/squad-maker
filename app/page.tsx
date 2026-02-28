"use client";

import { useState, useMemo } from "react";
import {
  Users,
  Zap,
  Trash2,
  ChevronDown,
  ChevronUp,
  Target,
  Shield,
  AlertTriangle,
} from "lucide-react";
import { usePlayers } from "@/hooks/usePlayers";
import { AddPlayerForm } from "@/components/AddPlayerForm";
import { PlayerCard } from "@/components/PlayerCard";
import { GenerateModal } from "@/components/GenerateModal";
import { TierBadge } from "@/components/TierBadge";
import { getTierDistribution } from "@/lib/utils";
import { TIER_CONFIG, Tier } from "@/types";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/useToast";

export default function HomePage() {
  const {
    players,
    isLoaded,
    addPlayer,
    removePlayer,
    updatePlayerTier,
    updatePlayerName,
    clearAllPlayers,
  } = usePlayers();

  const [showModal, setShowModal] = useState(false);
  const [showAddForm, setShowAddForm] = useState(true);
  const [filterTier, setFilterTier] = useState<Tier | "ALL">("ALL");


  const tierDist = useMemo(() => getTierDistribution(players), [players]);

  const filteredPlayers = useMemo(() =>
    filterTier === "ALL"
      ? players
      : players.filter((p) => p.tier === filterTier),
    [players, filterTier]
  );

  const handleAddPlayer = (name: string, tier: Tier) => {
    addPlayer(name, tier);
    toast({
      title: `${name} 등록 완료`,
      description: `티어 ${tier} — ${TIER_CONFIG[tier].description}`,
    });
  };

  const handleClearAll = () => {
    clearAllPlayers();
    toast({ title: "전체 삭제 완료" });
  };

  const canGenerate = players.length >= 2;

  return (
    <div className="min-h-screen bg-background grid-bg relative overflow-x-hidden">
      {/* 배경 글로우 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-48 -right-48 w-96 h-96 rounded-full opacity-[0.03]"
          style={{ background: "radial-gradient(circle, #00ff88 0%, transparent 70%)" }}
        />
        <div
          className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full opacity-[0.03]"
          style={{ background: "radial-gradient(circle, #00d4ff 0%, transparent 70%)" }}
        />
      </div>

      <div className="relative max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* ─── 헤더 ─── */}
        <header className="animate-fade-in-up">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Target size={16} className="text-primary" />
                <span
                  className="text-xs text-muted-foreground uppercase tracking-[0.3em] font-semibold"
                  style={{ fontFamily: "var(--font-dm-mono)" }}
                >
                  SQUAD MAKER v1.0
                </span>
              </div>
              <h1
                className="text-4xl font-black uppercase tracking-tight leading-none"
                style={{ fontFamily: "var(--font-rajdhani)" }}
              >
                <span className="neon-text">SQUAD</span>
                <span className="text-foreground/80"> MAKER</span>
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                공정하고 빠른 팀 구성 도구
              </p>
            </div>

            {/* 참가자 카운터 */}
            {isLoaded && (
              <div
                className="flex flex-col items-center justify-center w-16 h-16 rounded-xl border border-primary/30 bg-primary/5"
                style={{ fontFamily: "var(--font-dm-mono)" }}
              >
                <span className="text-2xl font-black text-primary leading-none">
                  {players.length}
                </span>
                <span className="text-xs text-muted-foreground">명</span>
              </div>
            )}
          </div>

          {/* 티어 분포 바 */}
          {isLoaded && players.length > 0 && (
            <div className="mt-4 space-y-1.5">
              <div className="flex justify-between text-xs text-muted-foreground" style={{ fontFamily: "var(--font-dm-mono)" }}>
                <span>TIER DISTRIBUTION</span>
                <span>{players.length} PLAYERS</span>
              </div>
              <div className="flex h-2 rounded-full overflow-hidden gap-0.5">
                {(Object.keys(TIER_CONFIG) as Tier[]).map((t) => {
                  const count = tierDist[t];
                  if (count === 0) return null;
                  const pct = (count / players.length) * 100;
                  return (
                    <div
                      key={t}
                      title={`${t}: ${count}명`}
                      className={cn("transition-all duration-500", TIER_CONFIG[t].bgClass)}
                      style={{ width: `${pct}%` }}
                    />
                  );
                })}
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                {(Object.keys(TIER_CONFIG) as Tier[]).map((t) => {
                  if (tierDist[t] === 0) return null;
                  return (
                    <div key={t} className="flex items-center gap-1">
                      <TierBadge tier={t} size="sm" />
                      <span className="text-xs text-muted-foreground" style={{ fontFamily: "var(--font-dm-mono)" }}>
                        {tierDist[t]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </header>

        {/* ─── 팀 생성 버튼 ─── */}
        <div className="animate-fade-in-up delay-100">
          {!canGenerate ? (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-yellow-500/20 bg-yellow-500/5">
              <AlertTriangle size={16} className="text-yellow-500 shrink-0" />
              <p className="text-sm text-yellow-500/80">
                팀을 구성하려면 최소 2명 이상 등록이 필요합니다.
              </p>
            </div>
          ) : (
            <button
              onClick={() => setShowModal(true)}
              className={cn(
                "w-full flex items-center justify-center gap-3 py-4 rounded-xl",
                "font-black text-lg uppercase tracking-widest",
                "bg-gradient-to-r from-primary to-[#00d4ff] text-primary-foreground",
                "hover:shadow-neon-green hover:scale-[1.01] active:scale-[0.99]",
                "transition-all duration-300"
              )}
              style={{ fontFamily: "var(--font-rajdhani)" }}
            >
              <Zap size={20} />
              팀 구성하기
              <Shield size={18} className="opacity-60" />
            </button>
          )}
        </div>

        {/* ─── 플레이어 등록 패널 ─── */}
        <div
          className="rounded-xl border border-border bg-card overflow-hidden animate-fade-in-up delay-200"
        >
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-secondary/30 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Users size={16} className="text-primary" />
              <span
                className="font-bold text-sm uppercase tracking-widest"
                style={{ fontFamily: "var(--font-rajdhani)" }}
              >
                플레이어 등록
              </span>
            </div>
            {showAddForm ? (
              <ChevronUp size={16} className="text-muted-foreground" />
            ) : (
              <ChevronDown size={16} className="text-muted-foreground" />
            )}
          </button>

          {showAddForm && (
            <div className="px-5 pb-5 pt-0 border-t border-border">
              <div className="pt-4">
                <AddPlayerForm onAdd={handleAddPlayer} />
              </div>
            </div>
          )}
        </div>

        {/* ─── 플레이어 목록 ─── */}
        {isLoaded && players.length > 0 && (
          <div className="space-y-3 animate-fade-in-up delay-300">
            {/* 목록 헤더 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="text-xs text-muted-foreground uppercase tracking-widest font-semibold"
                  style={{ fontFamily: "var(--font-dm-mono)" }}
                >
                  ROSTER — {filteredPlayers.length}
                  {filterTier !== "ALL" ? ` / ${players.length}` : ""}명
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* 티어 필터 */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setFilterTier("ALL")}
                    className={cn(
                      "px-2 py-1 rounded text-xs font-bold transition-all",
                      filterTier === "ALL"
                        ? "bg-primary/20 text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                    style={{ fontFamily: "var(--font-dm-mono)" }}
                  >
                    ALL
                  </button>
                  {(Object.keys(TIER_CONFIG) as Tier[]).filter(t => tierDist[t] > 0).map((t) => (
                    <button
                      key={t}
                      onClick={() => setFilterTier(filterTier === t ? "ALL" : t)}
                      className={cn(
                        "transition-all",
                        filterTier === t ? "scale-110" : "opacity-60 hover:opacity-100"
                      )}
                    >
                      <TierBadge tier={t} size="sm" />
                    </button>
                  ))}
                </div>

                {/* 전체 삭제 */}
                <button
                  onClick={handleClearAll}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 border border-border text-muted-foreground hover:border-destructive/40 hover:text-destructive"
                >
                  <Trash2 size={12} />
                  전체삭제
                </button>
              </div>
            </div>

            {/* 플레이어 카드 목록 */}
            <div className="space-y-1.5">
              {filteredPlayers.length > 0 ? (
                filteredPlayers.map((player, idx) => (
                  <PlayerCard
                    key={player.id}
                    player={player}
                    index={idx}
                    onRemove={removePlayer}
                    onUpdateTier={updatePlayerTier}
                    onUpdateName={updatePlayerName}
                  />
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground/40 text-sm">
                  선택한 티어의 플레이어가 없습니다
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── 빈 상태 ─── */}
        {isLoaded && players.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 space-y-4 animate-fade-in-up delay-300">
            <div className="w-20 h-20 rounded-full border-2 border-dashed border-primary/20 flex items-center justify-center">
              <Users size={32} className="text-primary/30" />
            </div>
            <div className="text-center">
              <p className="text-muted-foreground font-semibold">아직 등록된 플레이어가 없습니다</p>
              <p className="text-sm text-muted-foreground/50 mt-1">위 폼에서 플레이어를 추가해보세요</p>
            </div>
          </div>
        )}

        {/* 하단 여백 */}
        <div className="h-8" />
      </div>

      {/* ─── 팀 생성 모달 ─── */}
      {showModal && (
        <GenerateModal
          players={players}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
