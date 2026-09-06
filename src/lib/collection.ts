import { useEffect, useSyncExternalStore } from "react";
import { CARDS, PACKS, STARTER_DECKS, type CardDef, type Rarity } from "@/data/cards";

export interface Profile {
  coins: number;
  owned: Record<string, number>;
  deck: string[];
  starter: string | null;
  tutorialDone: boolean;
  wins: number;
  losses: number;
}

const STORAGE_KEY = "mirrorrealm.profile.v1";

const DEFAULT_PROFILE: Profile = {
  coins: 300,
  owned: {},
  deck: [],
  starter: null,
  tutorialDone: false,
  wins: 0,
  losses: 0,
};

let state: Profile = DEFAULT_PROFILE;
let loaded = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

export function loadProfile() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) state = { ...DEFAULT_PROFILE, ...(JSON.parse(raw) as Profile) };
  } catch {
    /* ignore */
  }
  emit();
}

function update(fn: (p: Profile) => Profile) {
  state = fn(state);
  persist();
  emit();
}

export function useProfile(): Profile {
  const p = useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => state,
    () => DEFAULT_PROFILE,
  );
  useEffect(() => {
    loadProfile();
  }, []);
  return p;
}

export function addCards(ids: string[]) {
  update((p) => {
    const owned = { ...p.owned };
    ids.forEach((id) => {
      owned[id] = (owned[id] ?? 0) + 1;
    });
    return { ...p, owned };
  });
}

export function spendCoins(n: number) {
  update((p) => ({ ...p, coins: Math.max(0, p.coins - n) }));
}

export function earnCoins(n: number) {
  update((p) => ({ ...p, coins: p.coins + n }));
}

export function setDeck(deck: string[]) {
  update((p) => ({ ...p, deck }));
}

export function completeTutorial() {
  update((p) => (p.tutorialDone ? p : { ...p, tutorialDone: true, coins: p.coins + 100 }));
}

export function chooseStarter(id: string) {
  const starter = STARTER_DECKS.find((d) => d.id === id);
  if (!starter) return;
  update((p) => {
    const owned = { ...p.owned };
    starter.cards.forEach((c) => {
      owned[c] = (owned[c] ?? 0) + 1;
    });
    return { ...p, owned, starter: id, deck: [...starter.cards] };
  });
}

export function recordResult(win: boolean) {
  update((p) => ({
    ...p,
    wins: p.wins + (win ? 1 : 0),
    losses: p.losses + (win ? 0 : 1),
    coins: p.coins + (win ? 120 : 40),
  }));
}

export function resetProfile() {
  state = { ...DEFAULT_PROFILE };
  persist();
  emit();
}

const PACK_WEIGHTS: Record<Rarity, number> = {
  C: 55,
  UC: 25,
  R: 12,
  E: 5,
  L: 2.5,
  M: 0.5,
};

function rollRarity(): Rarity {
  const total = Object.values(PACK_WEIGHTS).reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (const [rarity, w] of Object.entries(PACK_WEIGHTS) as [Rarity, number][]) {
    r -= w;
    if (r <= 0) return rarity;
  }
  return "C";
}

export interface PulledCard {
  card: CardDef;
  foil: boolean;
  serial: string;
}

export function openPack(packId: string): PulledCard[] {
  const pack = PACKS.find((p) => p.id === packId);
  if (!pack) return [];
  const pool = CARDS.filter((c) => pack.sets.includes(c.set));
  const results: PulledCard[] = [];
  for (let i = 0; i < pack.cardCount; i++) {
    let rarity = rollRarity();
    let candidates = pool.filter((c) => c.rarity === rarity);
    while (!candidates.length) {
      rarity = "C";
      candidates = pool.filter((c) => c.rarity === "C");
    }
    const card = candidates[Math.floor(Math.random() * candidates.length)];
    results.push({
      card,
      foil: Math.random() < 0.08,
      serial: String(Math.floor(Math.random() * 99999) + 1).padStart(5, "0"),
    });
  }
  return results;
}

export const DECK_MIN = 20;
export const DECK_MAX = 40;
export const MAX_COPIES = 3;
