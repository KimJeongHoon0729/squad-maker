"use client";

import { useState } from "react";
import { Pencil, Trash2, Check, X } from "lucide-react";
import { Player, Tier, TIER_CONFIG } from "@/types";
import { TierBadge } from "@/components/TierBadge";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PlayerCardProps {
  player: Player;
  onRemove: (id: string) => void;
  onUpdateTier: (id: string, tier: Tier) => void;
  onUpdateName: (id: string, name: string) => void;
  index: number;
}

export function PlayerCard({ player, onRemove, onUpdateTier, onUpdateName, index }: PlayerCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(player.name);
  const [isRemoving, setIsRemoving] = useState(false);

  const handleSave = () => {
    if (editName.trim()) {
      onUpdateName(player.id, editName);
    } else {
      setEditName(player.name);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditName(player.name);
    setIsEditing(false);
  };

  const handleRemove = () => {
    setIsRemoving(true);
    setTimeout(() => onRemove(player.id), 300);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") handleCancel();
  };

  return (
    <div
      className={cn(
        "group relative flex items-center gap-3 p-3 rounded-lg border transition-all duration-300",
        "bg-card border-border hover:border-primary/30",
        "animate-fade-in-up",
        isRemoving && "opacity-0 scale-95 -translate-x-4"
      )}
      style={{ animationDelay: `${index * 50}ms`, animationFillMode: "both" }}
    >
      {/* 왼쪽 순번 */}
      <span
        className="text-muted-foreground/40 text-xs font-mono w-5 text-right shrink-0"
        style={{ fontFamily: "var(--font-dm-mono)" }}
      >
        {String(index + 1).padStart(2, "0")}
      </span>

      {/* 티어 배지 */}
      <Select
        value={player.tier}
        onValueChange={(val) => onUpdateTier(player.id, val as Tier)}
      >
        <SelectTrigger className="w-auto h-auto border-0 bg-transparent p-0 focus:ring-0 hover:bg-transparent">
          <TierBadge tier={player.tier} size="md" />
        </SelectTrigger>
        <SelectContent className="bg-card border-border">
          {(Object.keys(TIER_CONFIG) as Tier[]).map((t) => (
            <SelectItem key={t} value={t} className="cursor-pointer">
              <div className="flex items-center gap-2">
                <TierBadge tier={t} size="sm" />
                <span className="text-sm text-muted-foreground">{TIER_CONFIG[t].description}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* 이름 */}
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            className="w-full bg-transparent border-b border-primary/50 outline-none text-sm font-semibold text-foreground py-0.5"
            style={{ fontFamily: "var(--font-rajdhani)" }}
          />
        ) : (
          <span className="text-sm font-semibold text-foreground truncate block">
            {player.name}
          </span>
        )}
      </div>

      {/* 액션 버튼 */}
      <div className={cn(
        "flex items-center gap-1 transition-opacity duration-200",
        isEditing ? "opacity-100" : "opacity-0 group-hover:opacity-100"
      )}>
        {isEditing ? (
          <>
            <button
              onClick={handleSave}
              className="p-1.5 rounded hover:bg-primary/20 text-primary transition-colors"
            >
              <Check size={14} />
            </button>
            <button
              onClick={handleCancel}
              className="p-1.5 rounded hover:bg-destructive/20 text-destructive transition-colors"
            >
              <X size={14} />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setIsEditing(true)}
              className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={handleRemove}
              className="p-1.5 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </>
        )}
      </div>

      {/* 호버 글로우 라인 */}
      <div
        className="absolute left-0 top-0 bottom-0 w-0.5 rounded-l-lg opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ background: TIER_CONFIG[player.tier].color }}
      />
    </div>
  );
}
