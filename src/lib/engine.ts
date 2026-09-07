import { getCard, type CardDef } from "@/data/cards";

export type SideKey = "you" | "foe";

export interface UnitInst {
  uid: number;
  cardId: string;
  atk: number;
  hp: number;
  maxHp: number;
  ready: boolean;
  stunned: boolean;
}

export interface Side {
  name: string;
  life: number;
  erosion: number;
  light: number;
  shadow: number;
  deck: string[];
  hand: string[];
  field: (UnitInst | null)[];
}

export interface GameState {
  you: Side;
  foe: Side;
  active: SideKey;
  round: number;
  log: string[];
  winner: SideKey | null;
  uidSeq: number;
}

export const FIELD_SIZE = 3;
export const START_LIFE = 20;
const HAND_LIMIT = 8;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

function makeSide(name: string, deck: string[]): Side {
  return {
    name,
    life: START_LIFE,
    erosion: 0,
    light: 0,
    shadow: 0,
    deck: shuffle(deck),
    hand: [],
    field: Array(FIELD_SIZE).fill(null),
  };
}

function push(s: GameState, msg: string) {
  s.log.push(msg);
  if (s.log.length > 60) s.log.shift();
}

function drawCards(s: GameState, key: SideKey, n: number) {
  const side = s[key];
  for (let i = 0; i < n; i++) {
    const id = side.deck.shift();
    if (!id) {
      side.life = 0;
      push(s, `${side.name}のデッキが尽きた！`);
      checkWinner(s);
      return;
    }
    if (side.hand.length < HAND_LIMIT) side.hand.push(id);
  }
}

export function createGame(playerDeck: string[], foeDeck: string[]): GameState {
  const s: GameState = {
    you: makeSide("あなた", playerDeck),
    foe: makeSide("敵術師", foeDeck),
    active: "you",
    round: 0,
    log: [],
    winner: null,
    uidSeq: 1,
  };
  drawCards(s, "you", 4);
  drawCards(s, "foe", 4);
  push(s, "対戦開始。鏡核ライフ20を削り切れ。");
  startTurn(s, "you");
  return s;
}

function startTurn(s: GameState, key: SideKey) {
  const side = s[key];
  s.active = key;
  if (key === "you") s.round += 1;
  const base = Math.min(1 + Math.floor(s.round / 2), 6);
  side.light = base;
  side.shadow = base;
  side.field.forEach((u) => {
    if (u) {
      u.ready = !u.stunned;
      u.stunned = false;
    }
  });
  drawCards(s, key, 1);
  push(s, `── ${side.name}のターン（光${base}／影${base}）`);
}

export function opposite(key: SideKey): SideKey {
  return key === "you" ? "foe" : "you";
}

/** 共鳴：隣接ゾーンに同シリーズがいると攻撃力+1 */
export function resonanceBonus(side: Side, zone: number): number {
  const u = side.field[zone];
  if (!u) return 0;
  const series = getCard(u.cardId).series;
  const neighbours = [zone - 1, zone + 1].filter((z) => z >= 0 && z < FIELD_SIZE);
  return neighbours.some((z) => {
    const n = side.field[z];
    return n && getCard(n.cardId).series === series;
  })
    ? 1
    : 0;
}

export function effectiveAtk(s: GameState, key: SideKey, zone: number): number {
  const side = s[key];
  const u = side.field[zone];
  if (!u) return 0;
  const def = getCard(u.cardId);
  let atk = u.atk + resonanceBonus(side, zone);
  if (def.effect.kind === "erosionPower" && s[opposite(key)].erosion >= 3) {
    atk += def.effect.value ?? 0;
  }
  return Math.max(0, atk);
}

export function canAfford(side: Side, def: CardDef): boolean {
  return side.light >= def.costLight && side.shadow >= def.costShadow;
}

export function isPlayable(s: GameState, key: SideKey, cardId: string): boolean {
  const def = getCard(cardId);
  const side = s[key];
  if (!canAfford(side, def)) return false;
  if (def.requiresErosion && s[opposite(key)].erosion < def.requiresErosion) return false;
  if (def.type === "unit" && !side.field.some((z) => z === null)) return false;
  if (def.effect.target === "enemyUnit" && !s[opposite(key)].field.some(Boolean)) return false;
  if (def.effect.target === "allyUnit" && !side.field.some(Boolean)) return false;
  return true;
}

export function needsTarget(cardId: string): "enemyUnit" | "allyUnit" | null {
  return getCard(cardId).effect.target ?? null;
}

function damageUnit(s: GameState, key: SideKey, zone: number, amount: number) {
  const side = s[key];
  const u = side.field[zone];
  if (!u) return;
  u.hp -= amount;
  if (u.hp <= 0) {
    push(s, `${getCard(u.cardId).name}が破壊された。`);
    side.field[zone] = null;
  }
}

function damageCore(s: GameState, key: SideKey, amount: number) {
  const side = s[key];
  side.life -= amount;
  side.erosion += 1;
  push(s, `${side.name}の鏡核に${amount}ダメージ（侵食${side.erosion}）。`);
  checkWinner(s);
}

function checkWinner(s: GameState) {
  if (s.you.life <= 0 && !s.winner) s.winner = "foe";
  else if (s.foe.life <= 0 && !s.winner) s.winner = "you";
}

function applyEffect(
  s: GameState,
  key: SideKey,
  def: CardDef,
  target?: { side: SideKey; zone: number },
) {
  const side = s[key];
  const foeKey = opposite(key);
  const v = def.effect.value ?? 0;
  switch (def.effect.kind) {
    case "gainLight":
      side.light += v;
      if (def.id === "star_matriarch") side.shadow += v;
      push(s, `光エネルギー+${v}。`);
      break;
    case "gainShadow":
      side.shadow += v;
      push(s, `影エネルギー+${v}。`);
      break;
    case "draw":
      drawCards(s, key, v);
      if (def.id === "mira") side.light += 1;
      push(s, `${v}枚ドロー。`);
      break;
    case "damageUnit":
      if (target) damageUnit(s, target.side, target.zone, v);
      break;
    case "damageCore":
      damageCore(s, foeKey, v);
      break;
    case "healCore":
      side.life = Math.min(START_LIFE + 10, side.life + v);
      push(s, `鏡核を${v}回復（残り${side.life}）。`);
      if (def.id === "lux_sovereign") drawCards(s, key, 1);
      break;
    case "buffAlly": {
      const t = target ?? { side: key, zone: side.field.findIndex(Boolean) };
      const u = s[t.side].field[t.zone];
      if (u) {
        u.atk += v;
        u.hp += v;
        u.maxHp += v;
        push(s, `${getCard(u.cardId).name}が+${v}/+${v}。`);
      }
      break;
    }
    case "stunAll":
      s[foeKey].field.forEach((u) => {
        if (u) {
          u.stunned = true;
          u.ready = false;
        }
      });
      push(s, "相手の全ユニットが行動不能になった！");
      break;
    default:
      break;
  }
}

export function playCard(
  state: GameState,
  key: SideKey,
  handIndex: number,
  zone?: number,
  target?: { side: SideKey; zone: number },
): GameState {
  const s = structuredClone(state);
  if (s.winner || s.active !== key) return state;
  const side = s[key];
  const cardId = side.hand[handIndex];
  if (!cardId || !isPlayable(s, key, cardId)) return state;
  const def = getCard(cardId);

  side.light -= def.costLight;
  side.shadow -= def.costShadow;
  side.hand.splice(handIndex, 1);

  if (def.type === "unit") {
    const slot = zone !== undefined && side.field[zone] === null ? zone : side.field.indexOf(null);
    if (slot < 0) return state;
    side.field[slot] = {
      uid: s.uidSeq++,
      cardId,
      atk: def.atk ?? 0,
      hp: def.hp ?? 1,
      maxHp: def.hp ?? 1,
      ready: false,
      stunned: false,
    };
    push(s, `${side.name}が${def.name}を召喚。`);
  } else {
    push(s, `${side.name}が${def.name}を発動。`);
  }
  applyEffect(s, key, def, target);
  checkWinner(s);
  return s;
}

export function attack(
  state: GameState,
  key: SideKey,
  zone: number,
  target: number | "core",
): GameState {
  const s = structuredClone(state);
  if (s.winner || s.active !== key) return state;
  const side = s[key];
  const foeKey = opposite(key);
  const foe = s[foeKey];
  const attacker = side.field[zone];
  if (!attacker || !attacker.ready) return state;
  const atk = effectiveAtk(s, key, zone);
  attacker.ready = false;

  const def = getCard(attacker.cardId);
  if (def.effect.kind === "weakenOnAttack") {
    const victimZone = foe.field.findIndex((u) => u && u.atk > 0);
    const victim = victimZone >= 0 ? foe.field[victimZone] : null;
    if (victim) {
      victim.atk = Math.max(0, victim.atk - (def.effect.value ?? 1));
      push(s, `${getCard(victim.cardId).name}の攻撃力が下がった。`);
    }
  }

  if (target === "core") {
    push(s, `${def.name}が鏡核へ攻撃。`);
    damageCore(s, foeKey, atk);
  } else {
    const blocker = foe.field[target];
    if (!blocker) return state;
    const blockerAtk = effectiveAtk(s, foeKey, target);
    push(s, `${def.name} が ${getCard(blocker.cardId).name} と交戦。`);
    damageUnit(s, foeKey, target, atk);
    damageUnit(s, key, zone, blockerAtk);
  }
  checkWinner(s);
  return s;
}

export function endTurn(state: GameState, key: SideKey): GameState {
  const s = structuredClone(state);
  if (s.winner || s.active !== key) return state;
  const foeKey = opposite(key);
  // ターン終了時効果
  s[key].field.forEach((u) => {
    if (u && getCard(u.cardId).effect.kind === "stunAll") {
      s[foeKey].erosion += 1;
    }
  });
  startTurn(s, foeKey);
  return s;
}

/** シンプルなAI：召喚 → 術 → 攻撃 → ターン終了 */
export function aiTurn(state: GameState): GameState {
  let s = state;
  const key: SideKey = "foe";
  if (s.winner || s.active !== key) return s;

  let guard = 0;
  while (guard++ < 12) {
    const side = s[key];
    const candidates = side.hand
      .map((id, i) => ({ id, i, def: getCard(id) }))
      .filter(({ id }) => isPlayable(s, key, id))
      .sort(
        (a, b) =>
          b.def.costLight + b.def.costShadow - (a.def.costLight + a.def.costShadow),
      );
    if (!candidates.length) break;
    const pick = candidates[0]!;
    let target: { side: SideKey; zone: number } | undefined;
    if (pick.def.effect.target === "enemyUnit") {
      const zone = s.you.field.findIndex(Boolean);
      if (zone >= 0) target = { side: "you", zone };
    } else if (pick.def.effect.target === "allyUnit") {
      const zone = side.field.findIndex(Boolean);
      if (zone >= 0) target = { side: key, zone };
    }
    const next = playCard(s, key, pick.i, undefined, target);
    if (next === s) break;
    s = next;
  }

  for (let zone = 0; zone < FIELD_SIZE; zone++) {
    const u = s.foe.field[zone];
    if (!u || !u.ready || s.winner) continue;
    const atk = effectiveAtk(s, key, zone);
    // 有利な交戦があれば行う、なければ鏡核へ
    let target: number | "core" = "core";
    for (let z = 0; z < FIELD_SIZE; z++) {
      const enemy = s.you.field[z];
      if (!enemy) continue;
      const enemyAtk = effectiveAtk(s, "you", z);
      if (atk >= enemy.hp && enemyAtk < u.hp) {
        target = z;
        break;
      }
    }
    if (target === "core" && s.you.field.some((e, z) => e && effectiveAtk(s, "you", z) >= 4)) {
      const z = s.you.field.findIndex((e, i) => e && effectiveAtk(s, "you", i) >= 4);
      if (z >= 0 && atk >= (s.you.field[z]?.hp ?? 99)) target = z;
    }
    s = attack(s, key, zone, target);
  }

  if (!s.winner) s = endTurn(s, key);
  return s;
}
