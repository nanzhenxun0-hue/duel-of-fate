export type Rarity = "C" | "UC" | "R" | "E" | "L" | "M";
export type Element = "light" | "shadow";
export type CardType = "unit" | "spell";

export type EffectKind =
  | "gainLight"
  | "gainShadow"
  | "draw"
  | "damageCore"
  | "damageUnit"
  | "healCore"
  | "buffAlly"
  | "weakenOnAttack"
  | "erosionPower"
  | "stunAll"
  | "erosionEachTurn"
  | "none";

export interface CardEffect {
  kind: EffectKind;
  value?: number;
  /** 対象選択が必要か */
  target?: "enemyUnit" | "allyUnit";
}

export interface CardDef {
  id: string;
  name: string;
  type: CardType;
  rarity: Rarity;
  series: string;
  costLight: number;
  costShadow: number;
  atk?: number;
  hp?: number;
  text: string;
  effect: CardEffect;
  /** ミシック等の特殊召喚条件（侵食カウンター） */
  requiresErosion?: number;
  set: "core" | "abyss" | "aurora";
}

export const RARITY_LABEL: Record<Rarity, string> = {
  C: "コモン",
  UC: "アンコモン",
  R: "レア",
  E: "エピック",
  L: "レジェンダリー",
  M: "ミシック",
};

export const RARITY_ORDER: Rarity[] = ["C", "UC", "R", "E", "L", "M"];

export const RARITY_STYLE: Record<Rarity, string> = {
  C: "text-muted-foreground border-border",
  UC: "text-emerald-300 border-emerald-400/40",
  R: "text-sky-300 border-sky-400/50",
  E: "text-violet-300 border-violet-400/50",
  L: "text-amber-300 border-amber-400/60",
  M: "text-rose-300 border-rose-400/70",
};

export const CARDS: CardDef[] = [
  // ── 光界 / コモン
  {
    id: "lumi",
    name: "光の使徒ルミ",
    type: "unit",
    rarity: "C",
    series: "光の使徒",
    costLight: 1,
    costShadow: 0,
    atk: 1,
    hp: 2,
    text: "出現時：光エネルギーを1得る。",
    effect: { kind: "gainLight", value: 1 },
    set: "core",
  },
  {
    id: "lumina_guard",
    name: "光の使徒セラ",
    type: "unit",
    rarity: "C",
    series: "光の使徒",
    costLight: 2,
    costShadow: 0,
    atk: 1,
    hp: 4,
    text: "堅牢な守り手。",
    effect: { kind: "none" },
    set: "core",
  },
  {
    id: "mirror_squire",
    name: "鏡騎士見習い",
    type: "unit",
    rarity: "C",
    series: "鏡騎士団",
    costLight: 2,
    costShadow: 0,
    atk: 2,
    hp: 2,
    text: "共鳴の要となる若き騎士。",
    effect: { kind: "none" },
    set: "core",
  },
  {
    id: "shade_rat",
    name: "影食みネズミ",
    type: "unit",
    rarity: "C",
    series: "影歩き",
    costLight: 0,
    costShadow: 1,
    atk: 2,
    hp: 1,
    text: "軽い一撃。",
    effect: { kind: "none" },
    set: "core",
  },
  {
    id: "umbra_acolyte",
    name: "影の侍祭",
    type: "unit",
    rarity: "C",
    series: "影歩き",
    costLight: 0,
    costShadow: 1,
    atk: 1,
    hp: 2,
    text: "出現時：影エネルギーを1得る。",
    effect: { kind: "gainShadow", value: 1 },
    set: "core",
  },
  {
    id: "star_cub",
    name: "星獣の仔",
    type: "unit",
    rarity: "C",
    series: "星獣",
    costLight: 1,
    costShadow: 1,
    atk: 2,
    hp: 3,
    text: "星の欠片を抱く獣。",
    effect: { kind: "none" },
    set: "core",
  },
  {
    id: "glimmer",
    name: "微光の一閃",
    type: "spell",
    rarity: "C",
    series: "術",
    costLight: 1,
    costShadow: 0,
    text: "敵ユニット1体に2ダメージ。",
    effect: { kind: "damageUnit", value: 2, target: "enemyUnit" },
    set: "core",
  },
  {
    id: "insight",
    name: "鏡面の洞察",
    type: "spell",
    rarity: "C",
    series: "術",
    costLight: 1,
    costShadow: 1,
    text: "カードを2枚引く。",
    effect: { kind: "draw", value: 2 },
    set: "core",
  },

  // ── アンコモン
  {
    id: "kagerou",
    name: "影歩きカゲロウ",
    type: "unit",
    rarity: "UC",
    series: "影歩き",
    costLight: 0,
    costShadow: 2,
    atk: 2,
    hp: 2,
    text: "攻撃時：相手ユニット1体の攻撃力を1下げる。",
    effect: { kind: "weakenOnAttack", value: 1 },
    set: "core",
  },
  {
    id: "mirror_knight",
    name: "鏡騎士アリア",
    type: "unit",
    rarity: "UC",
    series: "鏡騎士団",
    costLight: 3,
    costShadow: 0,
    atk: 3,
    hp: 3,
    text: "共鳴の中核を担う騎士。",
    effect: { kind: "none" },
    set: "core",
  },
  {
    id: "star_hound",
    name: "星獣ケイロン",
    type: "unit",
    rarity: "UC",
    series: "星獣",
    costLight: 1,
    costShadow: 2,
    atk: 3,
    hp: 2,
    text: "出現時：カードを1枚引く。",
    effect: { kind: "draw", value: 1 },
    set: "core",
  },
  {
    id: "core_mend",
    name: "鏡核の修復",
    type: "spell",
    rarity: "UC",
    series: "術",
    costLight: 2,
    costShadow: 0,
    text: "自分の鏡核を5回復する。",
    effect: { kind: "healCore", value: 5 },
    set: "core",
  },
  {
    id: "shadow_bolt",
    name: "影撃",
    type: "spell",
    rarity: "UC",
    series: "術",
    costLight: 0,
    costShadow: 2,
    text: "相手の鏡核に3ダメージ。",
    effect: { kind: "damageCore", value: 3 },
    set: "core",
  },
  {
    id: "resonant_ward",
    name: "共鳴の加護",
    type: "spell",
    rarity: "UC",
    series: "術",
    costLight: 1,
    costShadow: 1,
    text: "自分のユニット1体を+2/+2する。",
    effect: { kind: "buffAlly", value: 2, target: "allyUnit" },
    set: "core",
  },

  // ── レア
  {
    id: "mira",
    name: "双鏡の魔術師ミラ",
    type: "unit",
    rarity: "R",
    series: "鏡騎士団",
    costLight: 2,
    costShadow: 1,
    atk: 2,
    hp: 3,
    text: "出現時：カードを1枚引き、光を1得る。",
    effect: { kind: "draw", value: 1 },
    set: "core",
  },
  {
    id: "abyss_stalker",
    name: "深淵の追跡者",
    type: "unit",
    rarity: "R",
    series: "影歩き",
    costLight: 0,
    costShadow: 4,
    atk: 4,
    hp: 3,
    text: "攻撃時：相手ユニット1体の攻撃力を2下げる。",
    effect: { kind: "weakenOnAttack", value: 2 },
    set: "abyss",
  },
  {
    id: "aurora_seraph",
    name: "極光のセラフィム",
    type: "unit",
    rarity: "R",
    series: "光の使徒",
    costLight: 4,
    costShadow: 0,
    atk: 3,
    hp: 5,
    text: "出現時：自分の鏡核を3回復する。",
    effect: { kind: "healCore", value: 3 },
    set: "aurora",
  },
  {
    id: "star_matriarch",
    name: "星獣の母フェリス",
    type: "unit",
    rarity: "R",
    series: "星獣",
    costLight: 2,
    costShadow: 2,
    atk: 3,
    hp: 4,
    text: "出現時：光と影を1ずつ得る。",
    effect: { kind: "gainLight", value: 1 },
    set: "core",
  },
  {
    id: "erosion_lance",
    name: "侵食の槍",
    type: "spell",
    rarity: "R",
    series: "術",
    costLight: 1,
    costShadow: 2,
    text: "相手の鏡核に4ダメージ。",
    effect: { kind: "damageCore", value: 4 },
    set: "abyss",
  },
  {
    id: "mirror_purge",
    name: "鏡界の粛清",
    type: "spell",
    rarity: "R",
    series: "術",
    costLight: 3,
    costShadow: 1,
    text: "敵ユニット1体に6ダメージ。",
    effect: { kind: "damageUnit", value: 6, target: "enemyUnit" },
    set: "aurora",
  },

  // ── エピック
  {
    id: "voidmirror",
    name: "侵食竜ヴォイドミラー",
    type: "unit",
    rarity: "E",
    series: "侵食種",
    costLight: 2,
    costShadow: 3,
    atk: 4,
    hp: 5,
    text: "相手鏡核の侵食が3以上なら攻撃力+2。",
    effect: { kind: "erosionPower", value: 2 },
    set: "abyss",
  },
  {
    id: "dawn_paladin",
    name: "暁の聖騎士グラン",
    type: "unit",
    rarity: "E",
    series: "鏡騎士団",
    costLight: 4,
    costShadow: 1,
    atk: 5,
    hp: 5,
    text: "出現時：味方1体を+2/+2する。",
    effect: { kind: "buffAlly", value: 2, target: "allyUnit" },
    set: "aurora",
  },
  {
    id: "twin_eclipse",
    name: "双蝕の儀",
    type: "spell",
    rarity: "E",
    series: "術",
    costLight: 3,
    costShadow: 3,
    text: "相手の鏡核に7ダメージ。",
    effect: { kind: "damageCore", value: 7 },
    set: "abyss",
  },

  // ── レジェンダリー
  {
    id: "orthros",
    name: "鏡界支配者オルトロス",
    type: "unit",
    rarity: "L",
    series: "鏡界王",
    costLight: 4,
    costShadow: 4,
    atk: 6,
    hp: 6,
    text: "出現時：相手の全ユニットを1ターン行動不能にする。",
    effect: { kind: "stunAll" },
    set: "core",
  },
  {
    id: "lux_sovereign",
    name: "白光女王イリス",
    type: "unit",
    rarity: "L",
    series: "鏡界王",
    costLight: 6,
    costShadow: 0,
    atk: 5,
    hp: 7,
    text: "出現時：鏡核を6回復し、1枚引く。",
    effect: { kind: "healCore", value: 6 },
    set: "aurora",
  },

  // ── ミシック
  {
    id: "zero_mirror",
    name: "零の鏡",
    type: "spell",
    rarity: "M",
    series: "禁忌",
    costLight: 0,
    costShadow: 0,
    text: "相手鏡核の侵食が7以上の時のみ使用可能。相手鏡核に10ダメージ。",
    effect: { kind: "damageCore", value: 10 },
    requiresErosion: 7,
    set: "abyss",
  },
];

export const CARD_MAP: Record<string, CardDef> = Object.fromEntries(
  CARDS.map((c) => [c.id, c]),
);

export function getCard(id: string): CardDef {
  return CARD_MAP[id] as CardDef;
}

export interface PackDef {
  id: string;
  name: string;
  price: number;
  cardCount: number;
  sets: CardDef["set"][];
  description: string;
}

export const PACKS: PackDef[] = [
  {
    id: "core",
    name: "基本パック「鏡界の胎動」",
    price: 100,
    cardCount: 5,
    sets: ["core"],
    description: "基本セットのカードが5枚。共鳴デッキの土台づくりに。",
  },
  {
    id: "abyss",
    name: "拡張パック「深淵侵食」",
    price: 180,
    cardCount: 5,
    sets: ["core", "abyss"],
    description: "影と侵食に特化した攻撃的なカードを多く含む。",
  },
  {
    id: "aurora",
    name: "拡張パック「極光聖典」",
    price: 180,
    cardCount: 5,
    sets: ["core", "aurora"],
    description: "光の耐久・回復・大型ユニットが眠るパック。",
  },
];

export interface StarterDeck {
  id: string;
  name: string;
  concept: string;
  cards: string[];
}

const rep = (id: string, n: number) => Array.from({ length: n }, () => id);

export const STARTER_DECKS: StarterDeck[] = [
  {
    id: "light",
    name: "光界スターター「暁の誓約」",
    concept: "耐久力の高いユニットと回復で盤面を維持し、共鳴で押し切る。",
    cards: [
      ...rep("lumi", 3),
      ...rep("lumina_guard", 3),
      ...rep("mirror_squire", 3),
      ...rep("mirror_knight", 3),
      ...rep("star_cub", 2),
      ...rep("aurora_seraph", 2),
      ...rep("core_mend", 2),
      ...rep("insight", 2),
      ...rep("glimmer", 2),
      ...rep("resonant_ward", 2),
    ],
  },
  {
    id: "shadow",
    name: "影界スターター「侵食の牙」",
    concept: "低コストの影ユニットで殴り続け、侵食を溜めて一気に削る。",
    cards: [
      ...rep("shade_rat", 3),
      ...rep("umbra_acolyte", 3),
      ...rep("kagerou", 3),
      ...rep("abyss_stalker", 2),
      ...rep("star_hound", 3),
      ...rep("voidmirror", 2),
      ...rep("shadow_bolt", 3),
      ...rep("erosion_lance", 2),
      ...rep("insight", 2),
      ...rep("glimmer", 1),
    ],
  },
  {
    id: "balance",
    name: "均衡スターター「双鏡の理」",
    concept: "光と影を両立し、共鳴とドローで柔軟に立ち回る。",
    cards: [
      ...rep("lumi", 2),
      ...rep("umbra_acolyte", 2),
      ...rep("star_cub", 3),
      ...rep("star_hound", 2),
      ...rep("mira", 3),
      ...rep("star_matriarch", 2),
      ...rep("mirror_squire", 2),
      ...rep("kagerou", 2),
      ...rep("insight", 3),
      ...rep("resonant_ward", 2),
      ...rep("glimmer", 1),
    ],
  },
];
