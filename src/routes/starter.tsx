import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { STARTER_DECKS, getCard } from "@/data/cards";
import { chooseStarter, useProfile } from "@/lib/collection";
import { GameCard } from "@/components/GameCard";

export const Route = createFileRoute("/starter")({
  head: () => ({
    meta: [
      { title: "スターターデッキ選択 | 鏡界双戦" },
      {
        name: "description",
        content: "光界・影界・均衡の3種類の構築済みスターターデッキから、最初の1つを選んで対戦を始めよう。",
      },
      { property: "og:title", content: "スターターデッキ選択 | 鏡界双戦" },
      { property: "og:description", content: "3種の構築済みデッキから最初の1つを選ぶ。" },
    ],
  }),
  component: StarterPage,
});

function StarterPage() {
  const p = useProfile();
  const navigate = useNavigate();

  if (!p.tutorialDone) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6 text-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">まずはチュートリアルから</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            ルールを覚えてからスターターデッキを選びましょう。
          </p>
          <Link
            to="/tutorial"
            className="mt-6 inline-block rounded-md bg-primary px-5 py-2 text-sm font-bold text-primary-foreground"
          >
            チュートリアルへ
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <Link to="/" className="text-xs text-muted-foreground hover:text-foreground">
          ← ホーム
        </Link>
        <h1 className="mt-4 text-3xl font-black text-foreground">スターターデッキ</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {p.starter
            ? "すでに1つ選択済みです。追加のデッキはショップのパック開封で拡充できます。"
            : "1つだけ選べます。残りのカードはショップの拡張パックで手に入ります。"}
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {STARTER_DECKS.map((d) => {
            const unique = [...new Set(d.cards)];
            const chosen = p.starter === d.id;
            return (
              <section
                key={d.id}
                className={
                  "rounded-xl border p-5 " +
                  (chosen ? "border-lumen/60 bg-card" : "border-border bg-card/60")
                }
              >
                <h2 className="text-lg font-bold text-card-foreground">{d.name}</h2>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{d.concept}</p>
                <p className="mt-2 text-[11px] text-muted-foreground">{d.cards.length}枚構成</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {unique.slice(0, 6).map((id) => (
                    <GameCard
                      key={id}
                      card={getCard(id)}
                      size="sm"
                      count={d.cards.filter((c) => c === id).length}
                    />
                  ))}
                </div>
                <button
                  disabled={!!p.starter}
                  onClick={() => {
                    chooseStarter(d.id);
                    navigate({ to: "/battle" });
                  }}
                  className="mt-5 w-full rounded-md bg-primary px-4 py-2 text-sm font-bold text-primary-foreground disabled:opacity-40"
                >
                  {chosen ? "選択済み" : "このデッキで始める"}
                </button>
              </section>
            );
          })}
        </div>
      </div>
    </main>
  );
}
