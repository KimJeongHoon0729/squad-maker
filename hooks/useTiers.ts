"use client";

import { useState, useEffect, useCallback } from "react";
import { TierConfig, DEFAULT_TIERS } from "@/types";
import { supabase } from "@/lib/supabase";

export function useTiers() {
  const [tiers, setTiers] = useState<TierConfig[]>(DEFAULT_TIERS);
  const [isLoaded, setIsLoaded] = useState(false);

  const fetchTiers = useCallback(async () => {
    const { data, error } = await supabase
      .from("tiers")
      .select("*")
      .order("order", { ascending: true });

    if (error) {
      console.error("티어 로딩 실패:", error);
      setIsLoaded(true);
      return;
    }

    if (data && data.length > 0) {
      setTiers(
        data.map((row) => ({
          id: row.id,
          label: row.label,
          description: row.description,
          color: row.color,
          score: row.score,
          order: row.order,
        }))
      );
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    fetchTiers();
  }, [fetchTiers]);

  // 티어 추가
  const addTier = useCallback(async (tier: Omit<TierConfig, "id">) => {
    const { data, error } = await supabase
      .from("tiers")
      .insert(tier)
      .select()
      .single();

    if (error) {
      console.error("티어 추가 실패:", error);
      return null;
    }

    const newTier: TierConfig = {
      id: data.id,
      label: data.label,
      description: data.description,
      color: data.color,
      score: data.score,
      order: data.order,
    };

    setTiers((prev) => [...prev, newTier].sort((a, b) => a.order - b.order));
    return newTier;
  }, []);

  // 티어 수정
  const updateTier = useCallback(async (id: string, updates: Partial<Omit<TierConfig, "id">>) => {
    setTiers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );

    const { error } = await supabase.from("tiers").update(updates).eq("id", id);

    if (error) {
      console.error("티어 수정 실패:", error);
      fetchTiers(); // 실패 시 복원
    }
  }, [fetchTiers]);

  // 티어 삭제
  const deleteTier = useCallback(async (id: string) => {
    const backup = tiers.find((t) => t.id === id);
    setTiers((prev) => prev.filter((t) => t.id !== id));

    const { error } = await supabase.from("tiers").delete().eq("id", id);

    if (error) {
      console.error("티어 삭제 실패:", error);
      if (backup) setTiers((prev) => [...prev, backup].sort((a, b) => a.order - b.order));
    }
  }, [tiers]);

  // 순서 변경
  const reorderTiers = useCallback(async (reordered: TierConfig[]) => {
    const updated = reordered.map((t, idx) => ({ ...t, order: idx + 1 }));
    setTiers(updated);

    // 각 티어 순서 일괄 업데이트
    await Promise.all(
      updated.map((t) =>
        supabase.from("tiers").update({ order: t.order }).eq("id", t.id)
      )
    );
  }, []);

  // label로 TierConfig 찾기
  const getTierByLabel = useCallback(
    (label: string) => tiers.find((t) => t.label === label) ?? tiers[tiers.length - 1],
    [tiers]
  );

  return {
    tiers,
    isLoaded,
    addTier,
    updateTier,
    deleteTier,
    reorderTiers,
    getTierByLabel,
    refetch: fetchTiers,
  };
}
