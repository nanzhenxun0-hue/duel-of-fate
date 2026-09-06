import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PACKS } from "@/data/cards";
import { addCards, openPack, spendCoins, useProfile, type PulledCard } from "@/lib/collection";
import { GameCard } from "@/components/GameCard";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "ショップ・拡張パック開封 | 鏡界双戦" },
      {
        name: "description",
        content:
          "鏡片を使って拡張パックを開封。箔押しやシリアル番号付きの特殊レアリティを狙ってカードプールを広げよう。",
      },
      { property: "og:title", content: "ショップ・拡張パック開封 | 鏡界双戦" },
      { property: "og:description", content: "拡張パックを開封してカードを集める。" },
    ],
  }),
  component: Shop,
});

function Shop() {
  const p = useProfile();
  const [pulled, setPulled] = useState<PulledCard[] | null>(null);

  const buy = (packId: string, price: number) => {
    if (p.coins < price) return;
    spendCoins(price);
    const result = openPack(packId);
    addCards(result.map((r) => r.card.id));
    setPulled(result);
  };

  return (
    <main className="min-h-screen bg-background px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-xs text-muted-foreground hover:text-foreground">
            ← ホーム
          </Link>
          <span className="rounded-full border border-amber-300/40 px-3 py-1 text-sm text-amber-200">
            所持鏡片 {p.coins}
          </span>
        </div>
        <h1 className="mt-4 text-3xl font-black text-foreground">ショップ</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          鏡片はバトルの勝敗で獲得できます（勝利 +120 / 敗北 +40）。
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {PACKS.map((pack) => (
            <section key={pack.id} className="rounded-xl border border-border bg-card/60 p-5">
              <h2 className="text-lg font-bold text-card-foreground">{pack.name}</h2>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                {pack.description}
              </p>
              <p className="mt-3 text-[11px] text-muted-foreground">
                {pack.cardCount}枚入り／箔押し出現率 約8%
              </p>
              <button
                onClick={() => buy(pack.id, pack.price)}
                disabled={p.coins < pack.price}
                className="mt-4 w-full rounded-md bg-primary px-4 py-2 text-sm font-bold text-primary-foreground disabled:opacity-40"
              >
                {pack.price} 鏡片で開封
              </button>
            </section>
          ))}
        </div>

        {pulled && (
          <section className="mt-10 rounded-xl border border-amber-300/40 bg-card/60 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-card-foreground">開封結果</h2>
              <button
                onClick={() => setPulled(null)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                閉じる
              </button>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              {pulled.map((r, i) => (
                <GameCard key={i} card={r.card} foil={r.foil} serial={r.serial} />
              ))}
            </div>
            <Link
              to="/collection"
              className="mt-5 inline-block rounded-md border border-input px-4 py-2 text-sm"
            >
              デッキに入れる
            </Link>
          </section>
        )}
      </div>
    </main>
  );
}
