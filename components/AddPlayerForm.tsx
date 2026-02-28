"use client";

import { useState } from "react";
import { UserPlus, ChevronDown } from "lucide-react";
import { Tier, TIER_CONFIG } from "@/types";
import { TierBadge } from "@/components/TierBadge";
import { cn } from "@/lib/utils";

interface AddPlayerFormProps {
  onAdd: (name: string, tier: Tier) => void;
}

export function AddPlayerForm({ onAdd }: AddPlayerFormProps) {
  const [name, setName] = useState("");
  const [tier, setTier] = useState<Tier>("B");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("이름을 입력해주세요");
      return;
    }
    if (name.trim().length > 20) {
      setError("이름은 20자 이하로 입력해주세요");
      return;
    }
    setError("");
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 100));
    onAdd(name.trim(), tier);
    setName("");
    setIsSubmitting(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit(e as unknown as React.FormEvent);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* 이름 입력 */}
      <div className="space-y-1">
        <label className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">
          플레이어 이름
        </label>
        <div className="relative">
          <input
            value={name}
            onChange={(e) => { setName(e.target.value); setError(""); }}
            onKeyDown={handleKeyDown}
            placeholder="이름 입력..."
            maxLength={20}
            className={cn(
              "w-full bg-secondary border rounded-lg px-4 py-3 text-sm font-semibold outline-none transition-all duration-200",
              "placeholder:text-muted-foreground/40",
              "focus:border-primary/60 focus:shadow-neon-green",
              error ? "border-destructive/60" : "border-border"
            )}
            style={{ fontFamily: "var(--font-rajdhani)", letterSpacing: "0.05em" }}
          />
          {name && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground/40 font-mono">
              {name.length}/20
            </span>
          )}
        </div>
        {error && (
          <p className="text-xs text-destructive animate-fade-in-up">{error}</p>
        )}
      </div>

      {/* 티어 선택 */}
      <div className="space-y-1">
        <label className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">
          티어 선택
        </label>
        <div className="grid grid-cols-5 gap-2">
          {(Object.keys(TIER_CONFIG) as Tier[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTier(t)}
              className={cn(
                "flex flex-col items-center gap-1 py-2 px-1 rounded-lg border transition-all duration-200",
                tier === t
                  ? "border-primary/50 bg-primary/10 scale-105"
                  : "border-border bg-secondary hover:border-primary/30 hover:bg-secondary/80"
              )}
            >
              <TierBadge tier={t} size="sm" />
              <span className="text-xs text-muted-foreground" style={{ fontFamily: "var(--font-dm-mono)" }}>
                {TIER_CONFIG[t].description}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 추가 버튼 */}
      <button
        type="submit"
        disabled={isSubmitting || !name.trim()}
        className={cn(
          "w-full flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-sm uppercase tracking-widest transition-all duration-300",
          "bg-primary text-primary-foreground",
          "hover:shadow-neon-green hover:scale-[1.02]",
          "active:scale-[0.98]",
          "disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100 disabled:shadow-none",
          isSubmitting && "animate-pulse"
        )}
        style={{ clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)" }}
      >
        <UserPlus size={16} />
        <span>등록</span>
      </button>
    </form>
  );
}
