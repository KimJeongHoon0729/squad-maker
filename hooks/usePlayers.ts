"use client";

import { useState, useEffect, useCallback } from "react";
import { Player, Tier } from "@/types";
import { storage } from "@/lib/utils";
import { v4 as uuidv4 } from "uuid";

export function usePlayers() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = storage.getPlayers();
    setPlayers(saved);
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      storage.setPlayers(players);
    }
  }, [players, isLoaded]);

  const addPlayer = useCallback((name: string, tier: Tier) => {
    const newPlayer: Player = {
      id: uuidv4(),
      name: name.trim(),
      tier,
      createdAt: Date.now(),
    };
    setPlayers((prev) => [...prev, newPlayer]);
    return newPlayer;
  }, []);

  const removePlayer = useCallback((id: string) => {
    setPlayers((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const updatePlayerTier = useCallback((id: string, tier: Tier) => {
    setPlayers((prev) =>
      prev.map((p) => (p.id === id ? { ...p, tier } : p))
    );
  }, []);

  const updatePlayerName = useCallback((id: string, name: string) => {
    setPlayers((prev) =>
      prev.map((p) => (p.id === id ? { ...p, name: name.trim() } : p))
    );
  }, []);

  const clearAllPlayers = useCallback(() => {
    setPlayers([]);
  }, []);

  const importPlayers = useCallback((newPlayers: Player[]) => {
    setPlayers(newPlayers);
  }, []);

  return {
    players,
    isLoaded,
    addPlayer,
    removePlayer,
    updatePlayerTier,
    updatePlayerName,
    clearAllPlayers,
    importPlayers,
  };
}
