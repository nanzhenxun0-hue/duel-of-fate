import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { getCard, STARTER_DECKS } from "@/data/cards";
import { DECK_MIN, recordResult, useProfile } from "@/lib/collection";
import { GameCard } from "@/components/GameCard";
import {
  aiTurn,
  attack,
  createGame,
  effectiveAtk,
  endTurn,
  FIELD_SIZE,
  isPlayable,
  needsTarget,
  playCard,
  START_LIFE,
  type GameState,
  type SideKey,
  type UnitInst,
} from "@/lib/engine";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/battle")({
  head: () => ({
    meta: [
      { title: "バトル | 鏡界双戦" },
      {
        name: "description",
        content:
          "AI術師と1対1のデュエル。光と影のエネルギーを使い分け、共鳴と侵食を活かして鏡核を砕こう。",
      },
      { property: "og:title", content: "バトル | 鏡界双戦" },
      { property: "og:description", content: "AI術師と1対1のカードバトル。" },
    ],
  }),
  component: Battle,
});

function Battle() {
  const p = useProfile();
  const [game, setGame] = useState<GameState | null>(null);
  const [selHand, setSelHand] = useState<number | null>(null);
  const [selAttacker, setSelAttacker] = useState<number | null>(null);
  const recorded = useRef(false);

  const start = () => {
    recorded.current = false;
    setSelHand(null);
    setSelAttacker(null);
    const foe = STARTER_DECKS[Math.floor(Math.random() * STARTER_DECKS.length)].cards;
    setGame(createGame([...p.deck], [...foe]));
  };

  useEffect(() => {
    if (!game && p.deck.length >= DECK_MIN) start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p.deck.length]);

  useEffect(() => {
    if (!game || game.winner || game.active !== "foe") return;
    const t = setTimeout(() => setGame((g) => (g ? aiTurn(g) : g)), 800);
    return () => clearTimeout(t);
  }, [game]);

  useEffect(() => {
    if (game?.winner && !recorded.current) {
      recorded.current = true;
      recordResult(game.winner === "you");
    }
  }, [game?.winner]);

  if (p.deck.length < DECK_MIN) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6 text-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">デッキが足りません</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            バトルには{DECK_MIN}枚以上のデッキが必要です。まずはスターターデッキを選びましょう。
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              to="/starter"
              className="rounded-md bg-amber-300 px-5 py-2 text-sm font-bold text-black"
            >
              スターターを選ぶ
            </Link>
            <Link to="/collection" className="rounded-md border border-input px-5 py-2 text-sm">
              デッキ編成
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (!game) return <main className="min-h-screen bg-background" />;

  const yourTurn = game.active === "you" && !game.winner;
  const selCardId = selHand !== null ? game.you.hand[selHand] : null;
  const selDef = selCardId ? getCard(selCardId) : null;
  const targetMode = selCardId ? needsTarget(selCardId) : null;

  const play = (zone?: number, target?: { side: SideKey; zone: number }) => {
    if (selHand === null || !game) return;
    setGame(playCard(game, "you", selHand, zone, target));
    setSelHand(null);
  };

  const onEnemyZone = (zone: number) => {
    if (!yourTurn) return;
    if (selDef && targetMode === "enemyUnit" && game.foe.field[zone]) {
      play(undefined, { side: "foe", zone });
      return;
    }
    if (selAttacker !== null && game.foe.field[zone]) {
      setGame(attack(game, "you", selAttacker, zone));
      setSelAttacker(null);
    }
  };

  const onOwnZone = (zone: number) => {
    if (!yourTurn) return;
    const unit = game.you.field[zone];
    if (selDef) {
      if (targetMode === "allyUnit" && unit) {
        play(undefined, { side: "you", zone });
        return;
      }
      if (selDef.type === "unit" && !unit) {
        play(zone);
        return;
      }
      return;
    }
    if (unit && unit.ready) setSelAttacker(selAttacker === zone ? null : zone);
  };

  const attackCore = () => {
    if (!yourTurn || selAttacker === null) return;
    setGame(attack(game, "you", selAttacker, "core"));
    setSelAttacker(null);
  };

  return (
    <main className="min-h-screen bg-background px-4 py-6">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-xs text-muted-foreground hover:text-foreground">
            ← ホーム
          </Link>
          <button onClick={start} className="text-xs text-muted-foreground hover:text-foreground">
            リスタート
          </button>
        </div>

        {/* 敵 */}
        <CoreBar side="foe" state={game} onClick={attackCore} clickable={selAttacker !== null} />
        <FieldRow
          units={game.foe.field}
          state={game}
          owner="foe"
          onZone={onEnemyZone}
          highlight={selAttacker !== null || targetMode === "enemyUnit"}
        />

        <div className="my-4 h-px bg-border" />

        {/* 自分 */}
        <FieldRow
          units={game.you.field}
          state={game}
          owner="you"
          onZone={onOwnZone}
          highlight={
            (selDef?.type === "unit" && yourTurn) || targetMode === "allyUnit"
          }
          selectedZone={selAttacker}
        />
        <CoreBar side="you" state={game} />

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span className="rounded bg-amber-300/20 px-2 py-1 text-xs text-amber-200">
            光 {game.you.light}
          </span>
          <span className="rounded bg-violet-400/20 px-2 py-1 text-xs text-violet-200">
            影 {game.you.shadow}
          </span>
          <span className="text-xs text-muted-foreground">
            山札 {game.you.deck.length}枚 / ターン {game.round}
          </span>
          <button
            onClick={() => {
              setSelHand(null);
              setSelAttacker(null);
              setGame(endTurn(game, "you"));
            }}
            disabled={!yourTurn}
            className="ml-auto rounded-md bg-amber-300 px-4 py-2 text-sm font-bold text-black disabled:opacity-40"
          >
            {yourTurn ? "ターン終了" : "相手のターン…"}
          </button>
        </div>

        {selDef && (
          <p className="mt-2 text-xs text-amber-200">
            {selDef.type === "unit"
              ? "空いている自分のゾーンをクリックして召喚"
              : targetMode === "enemyUnit"
                ? "対象となる敵ユニットをクリック"
                : targetMode === "allyUnit"
                  ? "対象となる味方ユニットをクリック"
                  : "もう一度カードをクリックして発動"}
          </p>
        )}

        {/* 手札 */}
        <section className="mt-3 flex flex-wrap gap-2">
          {game.you.hand.map((id, i) => {
            const playable = yourTurn && isPlayable(game, "you", id);
            const def = getCard(id);
            const noTarget = !needsTarget(id) && def.type === "spell";
            return (
              <GameCard
                key={`${id}-${i}`}
                card={def}
                size="sm"
                selected={selHand === i}
                dimmed={!playable}
                onClick={
                  playable
                    ? () => {
                        if (selHand === i && noTarget) {
                          play();
                        } else {
                          setSelHand(selHand === i ? null : i);
                          setSelAttacker(null);
                          if (selHand !== i && noTarget) return;
                        }
                      }
                    : undefined
                }
              />
            );
          })}
        </section>

        {/* ログ */}
        <section className="mt-6 max-h-40 overflow-y-auto rounded-lg border border-border bg-card/40 p-3 text-xs text-muted-foreground">
          {[...game.log].reverse().map((l, i) => (
            <p key={i} className={i === 0 ? "text-foreground" : ""}>
              {l}
            </p>
          ))}
        </section>

        {game.winner && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/70 px-6">
            <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 text-center">
              <h2 className="text-2xl font-black text-card-foreground">
                {game.winner === "you" ? "勝利！" : "敗北…"}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {game.winner === "you" ? "+120 鏡片を獲得" : "+40 鏡片を獲得"}
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <button
                  onClick={start}
                  className="rounded-md bg-amber-300 px-4 py-2 text-sm font-bold text-black"
                >
                  もう一戦
                </button>
                <Link to="/shop" className="rounded-md border border-input px-4 py-2 text-sm">
                  ショップへ
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function CoreBar({
  side,
  state,
  onClick,
  clickable,
}: {
  side: SideKey;
  state: GameState;
  onClick?: () => void;
  clickable?: boolean;
}) {
  const s = state[side];
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!clickable}
      className={cn(
        "mt-4 flex w-full items-center justify-between rounded-lg border border-border bg-card/50 px-4 py-3",
        clickable && "border-destructive/60 hover:bg-destructive/10 cursor-pointer",
      )}
    >
      <span className="text-sm font-bold text-card-foreground">{s.name}の鏡核</span>
      <span className="flex items-center gap-3 text-xs text-muted-foreground">
        <span>侵食 {s.erosion}</span>
        <span>手札 {s.hand.length}</span>
        <span className="text-base font-black text-foreground">
          {s.life} / {START_LIFE}
        </span>
      </span>
    </button>
  );
}

function FieldRow({
  units,
  state,
  owner,
  onZone,
  highlight,
  selectedZone,
}: {
  units: (UnitInst | null)[];
  state: GameState;
  owner: SideKey;
  onZone: (zone: number) => void;
  highlight?: boolean;
  selectedZone?: number | null;
}) {
  return (
    <div className="mt-3 grid grid-cols-3 gap-3">
      {Array.from({ length: FIELD_SIZE }, (_, zone) => {
        const u = units[zone];
        return (
          <button
            key={zone}
            type="button"
            onClick={() => onZone(zone)}
            className={cn(
              "flex min-h-32 items-center justify-center rounded-lg border border-dashed border-border bg-card/30 p-2",
              highlight && "border-amber-300/60",
              selectedZone === zone && "ring-2 ring-amber-300",
            )}
          >
            {u ? (
              <div className="w-full">
                <p className="text-xs font-bold text-card-foreground">{getCard(u.cardId).name}</p>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  {getCard(u.cardId).series}
                </p>
                <p className="mt-2 text-sm font-black text-foreground">
                  {effectiveAtk(state, owner, zone)} / {u.hp}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {owner === "you" ? (u.ready ? "行動可能" : "行動済み") : ""}
                </p>
              </div>
            ) : (
              <span className="text-[10px] text-muted-foreground">空きゾーン</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
