"use client";

import { useState, useEffect } from "react";
import { Shuffle, Scale, ChevronRight, Zap, Users, ArrowLeft, RotateCcw, Copy } from "lucide-react";
import { Player, Team } from "@/types";
import { generateRandomTeams, generateBalancedTeams, calculateTeamScore, calculateBalanceScore } from "@/lib/utils";
import { TeamResultCard } from "@/components/TeamResultCard";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/useToast";

interface GenerateModalProps {
  players: Player[];
  onClose: () => void;
}

type Step = "config" | "loading" | "result";
type Mode = "random" | "balanced";

export function GenerateModal({ players, onClose }: GenerateModalProps) {
  const [step, setStep] = useState<Step>("config");
  const [mode, setMode] = useState<Mode>("balanced");
  const [teamCount, setTeamCount] = useState(2);
  const [teams, setTeams] = useState<Team[]>([]);
  const [scanProgress, setScanProgress] = useState(0);

  const maxTeams = Math.min(8, Math.floor(players.length / 1));
  const minPlayersPerTeam = Math.floor(players.length / teamCount);

  const handleGenerate = () => {
    setStep("loading");
    setScanProgress(0);

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.random() * 15 + 5;
      });
    }, 80);

    setTimeout(() => {
      clearInterval(interval);
      setScanProgress(100);
      const result = mode === "random"
        ? generateRandomTeams(players, teamCount)
        : generateBalancedTeams(players, teamCount);
      setTeams(result);
      setTimeout(() => setStep("result"), 300);
    }, 1800);
  };

  const handleRegenerate = () => {
    const result = mode === "random"
      ? generateRandomTeams(players, teamCount)
      : generateBalancedTeams(players, teamCount);
    setTeams(result);
    toast({ title: "팀 재배정 완료", description: "새로운 팀이 구성되었습니다." });
  };

  const handleCopyResult = () => {
    const text = teams.map((team) =>
      `【${team.name}】\n${team.players.map((p) => `  ${p.name} (${p.tier})`).join("\n")}`
    ).join("\n\n");
    navigator.clipboard.writeText(text).then(() => {
      toast({ title: "클립보드에 복사됨", description: "팀 결과가 복사되었습니다." });
    });
  };

  const balanceScore = teams.length > 0 ? calculateBalanceScore(teams) : 0;
  const maxScore = teams.length > 0 ? Math.max(...teams.map(calculateTeamScore)) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 오버레이 */}
      <div
        className="absolute inset-0 bg-black/85 backdrop-blur-md"
        onClick={step === "config" ? onClose : undefined}
      />

      {/* 모달 컨테이너 */}
      <div className="relative w-full max-w-3xl max-h-[90vh] mx-4 overflow-hidden rounded-xl border border-border bg-card shadow-2xl flex flex-col animate-fade-in-up">
        {/* 모달 헤더 상단 라인 */}
        <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-primary to-transparent" />

        {/* ─── STEP 1: 설정 ─── */}
        {step === "config" && (
          <div className="p-6 space-y-6 overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black uppercase tracking-widest text-foreground" style={{ fontFamily: "var(--font-rajdhani)" }}>
                  팀 구성 설정
                </h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  총 {players.length}명 참가
                </p>
              </div>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors p-2">
                <ArrowLeft size={18} />
              </button>
            </div>

            {/* 모드 선택 */}
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">
                팀 구성 방식
              </label>
              <div className="grid grid-cols-2 gap-3">
                {/* 랜덤 */}
                <button
                  onClick={() => setMode("random")}
                  className={cn(
                    "flex flex-col items-start gap-3 p-4 rounded-xl border transition-all duration-200",
                    mode === "random"
                      ? "border-accent/60 bg-accent/10 shadow-neon-orange"
                      : "border-border bg-secondary hover:border-accent/30"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <div className={cn("p-2 rounded-lg", mode === "random" ? "bg-accent/20" : "bg-secondary")}>
                      <Shuffle size={18} className={mode === "random" ? "text-accent" : "text-muted-foreground"} />
                    </div>
                    <span className={cn("font-bold text-sm uppercase tracking-wider", mode === "random" ? "text-accent" : "text-foreground")} style={{ fontFamily: "var(--font-rajdhani)" }}>
                      완전 랜덤
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground text-left leading-relaxed">
                    티어 무관, 완전히 랜덤으로 팀을 구성합니다. 운빨이 중요한 자리에 적합해요.
                  </p>
                </button>

                {/* 밸런스 */}
                <button
                  onClick={() => setMode("balanced")}
                  className={cn(
                    "flex flex-col items-start gap-3 p-4 rounded-xl border transition-all duration-200",
                    mode === "balanced"
                      ? "border-primary/60 bg-primary/10 shadow-neon-green"
                      : "border-border bg-secondary hover:border-primary/30"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <div className={cn("p-2 rounded-lg", mode === "balanced" ? "bg-primary/20" : "bg-secondary")}>
                      <Scale size={18} className={mode === "balanced" ? "text-primary" : "text-muted-foreground"} />
                    </div>
                    <span className={cn("font-bold text-sm uppercase tracking-wider", mode === "balanced" ? "text-primary" : "text-foreground")} style={{ fontFamily: "var(--font-rajdhani)" }}>
                      밸런스
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground text-left leading-relaxed">
                    티어를 고려해 각 팀의 실력이 균형을 이루도록 배치합니다.
                  </p>
                </button>
              </div>
            </div>

            {/* 팀 수 선택 */}
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">
                팀 수 선택
              </label>
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: Math.max(1, maxTeams - 1) }, (_, i) => i + 2).map((n) => (
                  <button
                    key={n}
                    onClick={() => setTeamCount(n)}
                    className={cn(
                      "flex flex-col items-center justify-center w-16 h-16 rounded-xl border font-bold transition-all duration-200",
                      teamCount === n
                        ? "border-primary/60 bg-primary/10 text-primary shadow-neon-green scale-105"
                        : "border-border bg-secondary text-muted-foreground hover:border-primary/30 hover:text-foreground"
                    )}
                    style={{ fontFamily: "var(--font-dm-mono)" }}
                  >
                    <span className="text-xl font-black">{n}</span>
                    <span className="text-xs opacity-60">팀</span>
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground" style={{ fontFamily: "var(--font-dm-mono)" }}>
                팀당 약 {minPlayersPerTeam}~{minPlayersPerTeam + 1}명
              </p>
            </div>

            {/* 생성 버튼 */}
            <button
              onClick={handleGenerate}
              className={cn(
                "w-full flex items-center justify-center gap-3 py-4 rounded-xl font-black text-base uppercase tracking-widest transition-all duration-300",
                mode === "balanced"
                  ? "bg-primary text-primary-foreground hover:shadow-neon-green"
                  : "bg-accent text-white hover:shadow-neon-orange",
                "hover:scale-[1.02] active:scale-[0.98]"
              )}
              style={{ clipPath: "polygon(12px 0%, 100% 0%, calc(100% - 12px) 100%, 0% 100%)" }}
            >
              <Zap size={18} />
              팀 생성하기
              <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* ─── STEP 2: 로딩 ─── */}
        {step === "loading" && (
          <div className="p-12 flex flex-col items-center justify-center gap-8 min-h-64">
            <div className="relative">
              {/* 외부 링 */}
              <div className="w-24 h-24 rounded-full border-2 border-primary/20 animate-spin" style={{ borderTopColor: "#00ff88" }} />
              {/* 내부 링 */}
              <div className="absolute inset-3 rounded-full border-2 border-primary/10 animate-spin" style={{ borderBottomColor: "#00d4ff", animationDirection: "reverse", animationDuration: "0.8s" }} />
              {/* 중앙 */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Users size={24} className="text-primary" />
              </div>
            </div>

            <div className="w-full max-w-xs space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground" style={{ fontFamily: "var(--font-dm-mono)" }}>
                <span>ANALYZING PLAYERS...</span>
                <span>{Math.min(100, Math.round(scanProgress))}%</span>
              </div>
              <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-100"
                  style={{
                    width: `${Math.min(100, scanProgress)}%`,
                    background: "linear-gradient(90deg, #00ff88, #00d4ff)",
                    boxShadow: "0 0 10px rgba(0, 255, 136, 0.5)",
                  }}
                />
              </div>
            </div>

            <p className="text-muted-foreground text-sm animate-pulse">
              {mode === "balanced" ? "최적의 밸런스 계산 중..." : "랜덤 배정 처리 중..."}
            </p>
          </div>
        )}

        {/* ─── STEP 3: 결과 ─── */}
        {step === "result" && (
          <div className="flex flex-col h-full overflow-hidden">
            {/* 결과 헤더 */}
            <div className="px-6 py-4 border-b border-border flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-lg font-black uppercase tracking-widest text-foreground" style={{ fontFamily: "var(--font-rajdhani)" }}>
                  팀 배정 완료
                </h2>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-xs text-muted-foreground" style={{ fontFamily: "var(--font-dm-mono)" }}>
                    {teams.length}팀 / {players.length}명
                  </span>
                  {mode === "balanced" && (
                    <span
                      className={cn(
                        "text-xs px-2 py-0.5 rounded font-semibold",
                        balanceScore === 0 ? "bg-primary/20 text-primary" :
                        balanceScore <= 2 ? "bg-yellow-500/20 text-yellow-400" :
                        "bg-destructive/20 text-destructive"
                      )}
                      style={{ fontFamily: "var(--font-dm-mono)" }}
                    >
                      밸런스 ±{balanceScore}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRegenerate}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-secondary hover:border-primary/30 text-sm font-semibold text-muted-foreground hover:text-foreground transition-all"
                >
                  <RotateCcw size={14} />
                  재배정
                </button>
                <button
                  onClick={handleCopyResult}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-secondary hover:border-primary/30 text-sm font-semibold text-muted-foreground hover:text-foreground transition-all"
                >
                  <Copy size={14} />
                  복사
                </button>
                <button
                  onClick={onClose}
                  className="px-3 py-2 rounded-lg border border-primary/30 bg-primary/10 text-primary text-sm font-bold hover:bg-primary/20 transition-all"
                >
                  완료
                </button>
              </div>
            </div>

            {/* 팀 카드 그리드 */}
            <div className="overflow-y-auto p-6">
              <div className={cn(
                "grid gap-4",
                teams.length <= 2 ? "grid-cols-1 sm:grid-cols-2" :
                teams.length <= 4 ? "grid-cols-2" :
                "grid-cols-2 lg:grid-cols-3"
              )}>
                {teams.map((team, idx) => (
                  <TeamResultCard
                    key={team.id}
                    team={team}
                    index={idx}
                    totalTeams={teams.length}
                    maxScore={maxScore}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
