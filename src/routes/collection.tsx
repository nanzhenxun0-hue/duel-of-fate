import { createFileRoute, Link } from "@tanstack/react-router";
import { CARDS, RARITY_ORDER, RARITY_LABEL, getCard } from "@/data/cards";
import { DECK_MAX, DECK_MIN, MAX_COPIES, setDeck, useProfile } from "@/lib/collection";
import { GameCard } from "@/components/GameCard";

export const Route = createFileRoute("/collection")({
  head: () => ({
    meta: [
      { title: "カードプールとデッキ編成 | 鏡界双戦" },
      {
        name: "description",
        content:
          "所持カードを一覧し、20〜40枚のデッキを編成。同名カードは最大3枚まで入れられます。",
      },
      { property: "og:title", content: "カードプールとデッキ編成 | 鏡界双戦" },
      { property: "og:description", content: "所持カードからデッキを組み立てる。" },
    ],
  }),
  component: Collection,
});

function Collection() {
  const p = useProfile();
  const deckCount = (id: string) => p.deck.filter((c) => c === id).length;

  const add = (id: string) => {
    if (p.deck.length >= DECK_MAX) return;
    if (deckCount(id) >= Math.min(MAX_COPIES, p.owned[id] ?? 0)) return;
    setDeck([...p.deck, id]);
  };
  const remove = (id: string) => {
    const idx = p.deck.indexOf(id);
    if (idx < 0) return;
    const next = [...p.deck];
    next.splice(idx, 1);
    setDeck(next);
  };

  const deckUnique = [...new Set(p.deck)];

  return (
    <main className="min-h-screen bg-background px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <Link to="/" className="text-xs text-muted-foreground hover:text-foreground">
          ← ホーム
        </Link>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
          <h1 className="text-3xl font-black text-foreground">カードプール / デッキ編成</h1>
          <span
            className={
              "rounded-full border px-3 py-1 text-sm " +
              (p.deck.length >= DECK_MIN
                ? "border-emerald-400/50 text-emerald-300"
                : "border-destructive/50 text-destructive")
            }
          >
            デッキ {p.deck.length} / {DECK_MAX}（最低{DECK_MIN}枚）
          </span>
        </div>

        {deckUnique.length > 0 && (
          <section className="mt-6 rounded-xl border border-border bg-card/50 p-4">
            <h2 className="text-sm font-bold text-card-foreground">現在のデッキ</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {deckUnique.map((id) => (
                <button
                  key={id}
                  onClick={() => remove(id)}
                  className="rounded-md border border-input px-2 py-1 text-xs hover:border-destructive hover:text-destructive"
                >
                  {getCard(id).name} ×{deckCount(id)} −
                </button>
              ))}
            </div>
          </section>
        )}

        {RARITY_ORDER.map((r) => {
          const cards = CARDS.filter((c) => c.rarity === r);
          return (
            <section key={r} className="mt-10">
              <h2 className="text-sm font-bold tracking-widest text-muted-foreground">
                {RARITY_LABEL[r]}（{r}）
              </h2>
              <div className="mt-3 flex flex-wrap gap-3">
                {cards.map((c) => {
                  const owned = p.owned[c.id] ?? 0;
                  return (
                    <div key={c.id} className="flex flex-col items-center gap-1">
                      <GameCard
                        card={c}
                        size="sm"
                        dimmed={owned === 0}
                        count={owned || undefined}
                        onClick={owned ? () => add(c.id) : undefined}
                      />
                      <span className="text-[10px] text-muted-foreground">
                        {owned ? `デッキ内 ${deckCount(c.id)}` : "未所持"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}

        <div className="mt-12 flex gap-3">
          <Link
            to="/shop"
            className="rounded-md border border-input px-4 py-2 text-sm hover:bg-accent"
          >
            ショップへ
          </Link>
          <Link
            to="/battle"
            className="rounded-md bg-amber-300 px-4 py-2 text-sm font-bold text-black"
          >
            この構成でバトル
          </Link>
        </div>
      </div>
    </main>
  );
}
