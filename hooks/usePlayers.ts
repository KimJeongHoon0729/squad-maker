"use client";

import { useState, useEffect, useCallback } from "react";
import { Player, Tier } from "@/types";
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";

export function usePlayers() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 전체 플레이어 목록 불러오기
  const fetchPlayers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("players")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) throw error;

      const mapped: Player[] = (data ?? []).map((row) => ({
        id: row.id,
        name: row.name,
        tier: row.tier as Tier,
        createdAt: new Date(row.created_at).getTime(),
      }));

      setPlayers(mapped);
    } catch (err) {
      setError("플레이어 목록을 불러오지 못했습니다.");
      console.error(err);
    } finally {
      setIsLoading(false);
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    fetchPlayers();
  }, [fetchPlayers]);

  // 플레이어 추가
  const addPlayer = useCallback(async (name: string, tier: Tier) => {
    const newPlayer: Player = {
      id: uuidv4(),
      name: name.trim(),
      tier,
      createdAt: Date.now(),
    };

    // 낙관적 업데이트 (즉시 UI 반영)
    setPlayers((prev) => [...prev, newPlayer]);

    const { error } = await supabase.from("players").insert({
      id: newPlayer.id,
      name: newPlayer.name,
      tier: newPlayer.tier,
    });

    if (error) {
      // 실패 시 롤백
      setPlayers((prev) => prev.filter((p) => p.id !== newPlayer.id));
      setError("플레이어 추가에 실패했습니다.");
      console.error(error);
      return null;
    }

    return newPlayer;
  }, []);

  // 플레이어 삭제
  const removePlayer = useCallback(async (id: string) => {
    const backup = players.find((p) => p.id === id);

    // 낙관적 업데이트
    setPlayers((prev) => prev.filter((p) => p.id !== id));

    const { error } = await supabase.from("players").delete().eq("id", id);

    if (error) {
      if (backup) setPlayers((list) => [...list, backup].sort((a, b) => a.createdAt - b.createdAt));
      setError("플레이어 삭제에 실패했습니다.");
      console.error(error);
    }
  }, [players]);

  // 티어 수정
  const updatePlayerTier = useCallback(async (id: string, tier: Tier) => {
    setPlayers((prev) =>
      prev.map((p) => (p.id === id ? { ...p, tier } : p))
    );

    const { error } = await supabase
      .from("players")
      .update({ tier })
      .eq("id", id);

    if (error) {
      setError("티어 변경에 실패했습니다.");
      console.error(error);
      fetchPlayers();
    }
  }, [fetchPlayers]);

  // 이름 수정
  const updatePlayerName = useCallback(async (id: string, name: string) => {
    setPlayers((prev) =>
      prev.map((p) => (p.id === id ? { ...p, name: name.trim() } : p))
    );

    const { error } = await supabase
      .from("players")
      .update({ name: name.trim() })
      .eq("id", id);

    if (error) {
      setError("이름 변경에 실패했습니다.");
      console.error(error);
      fetchPlayers();
    }
  }, [fetchPlayers]);

  // 전체 삭제
  const clearAllPlayers = useCallback(async () => {
    const backup = [...players];
    setPlayers([]);

    const { error } = await supabase.from("players").delete().gte("created_at", "1970-01-01");

    if (error) {
      setPlayers(backup);
      setError("전체 삭제에 실패했습니다.");
      console.error(error);
    }
  }, [players]);

  return {
    players,
    isLoaded,
    isLoading,
    error,
    addPlayer,
    removePlayer,
    updatePlayerTier,
    updatePlayerName,
    clearAllPlayers,
    refetch: fetchPlayers,
  };
}
