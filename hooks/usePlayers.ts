"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Player } from "@/types";
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";

export function usePlayers() {
  const [players, setPlayers] = useState<Player[]>([]);
  const playersRef = useRef<Player[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    playersRef.current = players;
  }, [players]);

  const fetchPlayers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("players")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) throw error;

      setPlayers(
        (data ?? []).map((row) => ({
          id: row.id,
          name: row.name,
          tierId: row.tier,   // DB 컬럼명 tier → tierId로 매핑
          createdAt: new Date(row.created_at).getTime(),
        }))
      );
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

  const addPlayer = useCallback(async (name: string, tierLabel: string) => {
    const newPlayer: Player = {
      id: uuidv4(),
      name: name.trim(),
      tierId: tierLabel,
      createdAt: Date.now(),
    };

    setPlayers((prev) => [...prev, newPlayer]);

    const { error } = await supabase.from("players").insert({
      id: newPlayer.id,
      name: newPlayer.name,
      tier: newPlayer.tierId,   // DB 저장 시 tier 컬럼
    });

    if (error) {
      setPlayers((prev) => prev.filter((p) => p.id !== newPlayer.id));
      setError("플레이어 추가에 실패했습니다.");
      console.error(error);
      return null;
    }
    return newPlayer;
  }, []);

  const removePlayer = useCallback(async (id: string) => {
    const backup = playersRef.current.find((p) => p.id === id);
    setPlayers((prev) => prev.filter((p) => p.id !== id));

    const { error } = await supabase.from("players").delete().eq("id", id);
    if (error) {
      if (backup) setPlayers((list) => [...list, backup].sort((a, b) => a.createdAt - b.createdAt));
      setError("플레이어 삭제에 실패했습니다.");
      console.error(error);
    }
  }, []);

  const updatePlayerTier = useCallback(async (id: string, tierLabel: string) => {
    setPlayers((prev) => prev.map((p) => (p.id === id ? { ...p, tierId: tierLabel } : p)));

    const { error } = await supabase.from("players").update({ tier: tierLabel }).eq("id", id);
    if (error) {
      setError("티어 변경에 실패했습니다.");
      console.error(error);
      fetchPlayers();
    }
  }, [fetchPlayers]);

  const updatePlayerName = useCallback(async (id: string, name: string) => {
    setPlayers((prev) => prev.map((p) => (p.id === id ? { ...p, name: name.trim() } : p)));

    const { error } = await supabase.from("players").update({ name: name.trim() }).eq("id", id);
    if (error) {
      setError("이름 변경에 실패했습니다.");
      console.error(error);
      fetchPlayers();
    }
  }, [fetchPlayers]);

  const clearAllPlayers = useCallback(async () => {
    const backup = [...playersRef.current];
    setPlayers([]);
    if (backup.length === 0) return;

    const ids = backup.map((p) => p.id);
    const { error } = await supabase.from("players").delete().in("id", ids);
    if (error) {
      setPlayers(backup);
      setError(`전체 삭제에 실패했습니다: ${error.message}`);
      console.error(error);
    }
  }, []);

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
