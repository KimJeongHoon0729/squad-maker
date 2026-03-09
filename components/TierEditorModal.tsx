"use client";

import { useState } from "react";
import { Plus, Trash2, GripVertical, X, Check, RotateCcw } from "lucide-react";
import { TierConfig, DEFAULT_TIERS } from "@/types";
import { cn } from "@/lib/utils";

interface TierEditorModalProps {
  tiers: TierConfig[];
  onClose: () => void;
  onAdd: (tier: Omit<TierConfig, "id">) => Promise<TierConfig | null>;
  onUpdate: (id: string, updates: Partial<Omit<TierConfig, "id">>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onReorder: (tiers: TierConfig[]) => Promise<void>;
}

const PRESET_COLORS = [
  "#ff4757", "#ff6b35", "#ffd700", "#00ff88",
  "#00d4ff", "#c678dd", "#a8b2d8", "#56b6c2",
  "#e06c75", "#98c379", "#61afef", "#e5c07b",
];

export function TierEditorModal({
  tiers,
  onClose,
  onAdd,
  onUpdate,
  onDelete,
  onReorder,
}: TierEditorModalProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<TierConfig>>({});
  const [isAdding, setIsAdding] = useState(false);
  const [newTier, setNewTier] = useState({ label: "", description: "", color: "#00ff88", score: 1 });
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // 편집 시작
  const startEdit = (tier: TierConfig) => {
    setEditingId(tier.id);
    setEditValues({ label: tier.label, description: tier.description, color: tier.color, score: tier.score });
  };

  // 편집 저장
  const saveEdit = async () => {
    if (!editingId || !editValues.label?.trim()) return;
    setIsSaving(true);
    await onUpdate(editingId, editValues);
    setEditingId(null);
    setEditValues({});
    setIsSaving(false);
  };

  // 편집 취소
  const cancelEdit = () => {
    setEditingId(null);
    setEditValues({});
  };

  // 새 티어 추가
  const handleAdd = async () => {
    if (!newTier.label.trim()) return;
    setIsSaving(true);
    await onAdd({
      label: newTier.label.trim().toUpperCase().slice(0, 3),
      description: newTier.description.trim() || newTier.label.trim(),
      color: newTier.color,
      score: newTier.score,
      order: tiers.length + 1,
    });
    setNewTier({ label: "", description: "", color: "#00ff88", score: 1 });
    setIsAdding(false);
    setIsSaving(false);
  };

  // 드래그 앤 드롭 순서 변경
  const handleDragStart = (idx: number) => setDragIdx(idx);
  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    setDragOverIdx(idx);
  };
  const handleDrop = async (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === idx) { setDragIdx(null); setDragOverIdx(null); return; }
    const reordered = [...tiers];
    const [moved] = reordered.splice(dragIdx, 1);
    reordered.splice(idx, 0, moved);
    setDragIdx(null);
    setDragOverIdx(null);
    await onReorder(reordered);
  };

  // 기본값으로 초기화
  const handleReset = async () => {
    if (!confirm("기본 티어(S/A/B/C/D)로 초기화할까요? 현재 티어 설정이 모두 삭제됩니다.")) return;
    setIsSaving(true);
    // 기존 전체 삭제
    await Promise.all(tiers.map((t) => onDelete(t.id)));
    // 기본 티어 추가
    for (const t of DEFAULT_TIERS) {
      await onAdd({ label: t.label, description: t.description, color: t.color, score: t.score, order: t.order });
    }
    setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/85 backdrop-blur-md" onClick={onClose} />

      <div className="relative w-full max-w-lg mx-4 rounded-xl border border-border bg-card shadow-2xl overflow-hidden animate-fade-in-up">
        {/* 상단 라인 */}
        <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-primary to-transparent" />

        {/* 헤더 */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-border">
          <div>
            <h2 className="text-lg font-black uppercase tracking-widest" style={{ fontFamily: "var(--font-rajdhani)" }}>
              티어 편집
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">드래그로 순서 변경 가능</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all"
            >
              <RotateCcw size={12} />
              초기화
            </button>
            <button onClick={onClose} className="p-2 text-muted-foreground hover:text-foreground transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* 티어 목록 */}
        <div className="px-6 py-4 space-y-2 max-h-[50vh] overflow-y-auto">
          {tiers.map((tier, idx) => (
            <div
              key={tier.id}
              draggable
              onDragStart={() => handleDragStart(idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDrop={(e) => handleDrop(e, idx)}
              onDragEnd={() => { setDragIdx(null); setDragOverIdx(null); }}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg border transition-all duration-150",
                dragOverIdx === idx ? "border-primary/60 bg-primary/10" : "border-border bg-secondary/30",
                dragIdx === idx && "opacity-40"
              )}
            >
              {/* 드래그 핸들 */}
              <div className="cursor-grab text-muted-foreground/40 hover:text-muted-foreground transition-colors">
                <GripVertical size={16} />
              </div>

              {editingId === tier.id ? (
                /* 편집 모드 */
                <div className="flex-1 grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2">
                    {/* 색상 */}
                    <input
                      type="color"
                      value={editValues.color ?? tier.color}
                      onChange={(e) => setEditValues((v) => ({ ...v, color: e.target.value }))}
                      className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent"
                    />
                    {/* 라벨 */}
                    <input
                      value={editValues.label ?? ""}
                      onChange={(e) => setEditValues((v) => ({ ...v, label: e.target.value.toUpperCase().slice(0, 3) }))}
                      placeholder="라벨"
                      maxLength={3}
                      className="w-14 bg-secondary border border-border rounded px-2 py-1 text-sm font-bold outline-none focus:border-primary/50"
                      style={{ fontFamily: "var(--font-dm-mono)" }}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    {/* 설명 */}
                    <input
                      value={editValues.description ?? ""}
                      onChange={(e) => setEditValues((v) => ({ ...v, description: e.target.value }))}
                      placeholder="설명"
                      className="flex-1 bg-secondary border border-border rounded px-2 py-1 text-sm outline-none focus:border-primary/50"
                    />
                    {/* 점수 */}
                    <input
                      type="number"
                      value={editValues.score ?? tier.score}
                      onChange={(e) => setEditValues((v) => ({ ...v, score: Number(e.target.value) }))}
                      min={1} max={99}
                      className="w-12 bg-secondary border border-border rounded px-2 py-1 text-sm text-center outline-none focus:border-primary/50"
                      style={{ fontFamily: "var(--font-dm-mono)" }}
                    />
                  </div>
                  {/* 색상 프리셋 */}
                  <div className="col-span-2 flex flex-wrap gap-1">
                    {PRESET_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setEditValues((v) => ({ ...v, color: c }))}
                        className={cn(
                          "w-5 h-5 rounded-sm transition-all",
                          editValues.color === c && "ring-2 ring-white scale-110"
                        )}
                        style={{ background: c }}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                /* 표시 모드 */
                <div className="flex-1 flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-sm flex items-center justify-center text-sm font-black text-white shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${tier.color}, ${tier.color}cc)`,
                      boxShadow: `0 0 8px ${tier.color}60`,
                      fontFamily: "var(--font-dm-mono)",
                    }}
                  >
                    {tier.label}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-semibold truncate block">{tier.description}</span>
                  </div>
                  <span
                    className="text-xs text-muted-foreground/60 shrink-0"
                    style={{ fontFamily: "var(--font-dm-mono)" }}
                  >
                    {tier.score}pt
                  </span>
                </div>
              )}

              {/* 액션 버튼 */}
              <div className="flex items-center gap-1 shrink-0">
                {editingId === tier.id ? (
                  <>
                    <button
                      onClick={saveEdit}
                      disabled={isSaving}
                      className="p-1.5 rounded hover:bg-primary/20 text-primary transition-colors"
                    >
                      <Check size={14} />
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="p-1.5 rounded hover:bg-secondary text-muted-foreground transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => startEdit(tier)}
                      className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover:opacity-100"
                    >
                      ✎
                    </button>
                    <button
                      onClick={() => onDelete(tier.id)}
                      disabled={tiers.length <= 1}
                      className="p-1.5 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                    >
                      <Trash2 size={14} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 새 티어 추가 */}
        <div className="px-6 pb-6 border-t border-border pt-4">
          {isAdding ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={newTier.color}
                    onChange={(e) => setNewTier((v) => ({ ...v, color: e.target.value }))}
                    className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent shrink-0"
                  />
                  <input
                    value={newTier.label}
                    onChange={(e) => setNewTier((v) => ({ ...v, label: e.target.value.toUpperCase().slice(0, 3) }))}
                    placeholder="라벨 (예: SS)"
                    maxLength={3}
                    autoFocus
                    className="flex-1 bg-secondary border border-border rounded px-2 py-1.5 text-sm font-bold outline-none focus:border-primary/50"
                    style={{ fontFamily: "var(--font-dm-mono)" }}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    value={newTier.description}
                    onChange={(e) => setNewTier((v) => ({ ...v, description: e.target.value }))}
                    placeholder="설명 (예: 전설)"
                    className="flex-1 bg-secondary border border-border rounded px-2 py-1.5 text-sm outline-none focus:border-primary/50"
                  />
                  <input
                    type="number"
                    value={newTier.score}
                    onChange={(e) => setNewTier((v) => ({ ...v, score: Number(e.target.value) }))}
                    min={1} max={99}
                    className="w-12 bg-secondary border border-border rounded px-2 py-1.5 text-sm text-center outline-none focus:border-primary/50"
                    style={{ fontFamily: "var(--font-dm-mono)" }}
                  />
                </div>
              </div>
              {/* 색상 프리셋 */}
              <div className="flex flex-wrap gap-1.5">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setNewTier((v) => ({ ...v, color: c }))}
                    className={cn("w-6 h-6 rounded-sm transition-all", newTier.color === c && "ring-2 ring-white scale-110")}
                    style={{ background: c }}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAdd}
                  disabled={!newTier.label.trim() || isSaving}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-bold uppercase tracking-widest disabled:opacity-40 hover:shadow-neon-green transition-all"
                >
                  <Check size={14} />
                  추가
                </button>
                <button
                  onClick={() => { setIsAdding(false); setNewTier({ label: "", description: "", color: "#00ff88", score: 1 }); }}
                  className="px-4 py-2.5 rounded-lg border border-border text-muted-foreground hover:text-foreground text-sm transition-all"
                >
                  취소
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsAdding(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-dashed border-primary/30 text-primary/70 hover:border-primary/60 hover:text-primary text-sm font-semibold transition-all"
            >
              <Plus size={16} />
              새 티어 추가
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
