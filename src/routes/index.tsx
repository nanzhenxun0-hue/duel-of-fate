import { createFileRoute, Link } from "@tanstack/react-router";
import { useProfile } from "@/lib/collection";
import { CARDS } from "@/data/cards";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "鏡界双戦 ミラーレルム・デュエル | 2人用対戦カードゲーム" },
      {
        name: "description",
        content:
          "光と影のエネルギーを操り、相手の鏡核を破壊する対戦カードゲーム。チュートリアル、スターターデッキ、拡張パック、バトルまで遊べます。",
      },
      { property: "og:title", content: "鏡界双戦 ミラーレルム・デュエル" },
      {
        property: "og:description",
        content: "光と影を操る戦術カードバトル。チュートリアルから対戦まで。",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const p = useProfile();
  const ownedKinds = Object.keys(p.owned).length;

  const items = [
    {
      to: "/tutorial" as const,
      title: "チュートリアル",
      desc: "ルールとギミックを5ステップで学ぶ",
      state: p.tutorialDone ? "完了" : "まずはここから",
      ready: true,
    },
    {
      to: "/starter" as const,
      title: "スターターデッキを選ぶ",
      desc: "3種の構築済みデッキから1つを獲得",
      state: p.starter ? "取得済み" : p.tutorialDone ? "選択可能" : "チュートリアル後",
      ready: p.tutorialDone,
    },
    {
      to: "/shop" as const,
      title: "ショップ",
      desc: "拡張パックを開封してカードを集める",
      state: `${p.coins} 鏡片`,
      ready: !!p.starter,
    },
    {
      to: "/collection" as const,
      title: "カードプール / デッキ編成",
      desc: `全${CARDS.length}種・所持${ownedKinds}種`,
      state: `デッキ${p.deck.length}枚`,
      ready: !!p.starter,
    },
    {
      to: "/battle" as const,
      title: "バトル",
      desc: "AI術師と1対1のデュエル",
      state: `${p.wins}勝 ${p.losses}敗`,
      ready: p.deck.length >= 20,
    },
  ];

  return (
    <main className="min-h-screen bg-background px-6 py-14">
      <div className="mx-auto max-w-4xl">
        <p className="text-xs tracking-[0.4em] text-muted-foreground">MIRRORREALM DUEL</p>
        <h1 className="mt-3 bg-gradient-to-r from-lumen via-foreground to-umbra bg-clip-text text-5xl font-black text-transparent">
          鏡界双戦
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
          光界と影界を行き来する術師となり、召喚と術で相手の鏡核（ライフ20）を砕く2人用戦術カードゲーム。
          共鳴・侵食・二重エネルギーの読み合いが勝敗を分けます。
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {items.map((it) => (
            <Link
              key={it.to}
              to={it.to}
              className={
                "group rounded-xl border border-border bg-card/60 p-5 transition hover:border-lumen/50 hover:bg-card " +
                (it.ready ? "" : "opacity-50")
              }
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-card-foreground">{it.title}</h2>
                <span className="text-[11px] text-muted-foreground">{it.state}</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{it.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
