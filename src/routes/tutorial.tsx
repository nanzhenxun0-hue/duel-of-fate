import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { completeTutorial, useProfile } from "@/lib/collection";
import { GameCard } from "@/components/GameCard";
import { getCard } from "@/data/cards";

export const Route = createFileRoute("/tutorial")({
  head: () => ({
    meta: [
      { title: "チュートリアル | 鏡界双戦" },
      {
        name: "description",
        content: "鏡核・二重エネルギー・共鳴・侵食・予言まで、鏡界双戦の遊び方を5ステップで学ぶ。",
      },
      { property: "og:title", content: "チュートリアル | 鏡界双戦" },
      { property: "og:description", content: "鏡界双戦の基本ルールを5ステップで習得。" },
    ],
  }),
  component: Tutorial,
});

const STEPS = [
  {
    title: "1. 勝利条件",
    body: "お互いの鏡核はライフ20。相手の鏡核を0にすれば勝ち。デッキが尽きてドローできなくなった側も敗北します。",
    cards: [],
  },
  {
    title: "2. 二重エネルギー",
    body: "毎ターン、光エネルギーと影エネルギーが同量だけ補充されます（ターンが進むほど増加、最大6）。カードは光コスト・影コストの組み合わせで支払います。",
    cards: ["lumi", "umbra_acolyte"],
  },
  {
    title: "3. 召喚と攻撃",
    body: "領域は3ゾーン。召喚したターンは攻撃できません。次のターンから、相手ユニットか鏡核を選んで攻撃できます。ユニット同士の交戦はお互いにダメージを与え合います。",
    cards: ["mirror_squire", "star_cub"],
  },
  {
    title: "4. 共鳴",
    body: "隣のゾーンに同じシリーズのユニットが並ぶと共鳴が発動し、攻撃力+1。並べ方そのものが戦術になります。",
    cards: ["mirror_knight", "mira"],
  },
  {
    title: "5. 侵食と逆転",
    body: "鏡核に攻撃が通るたび、侵食カウンターが1つ増えます。侵食が溜まると強力になるカードがあり、削られている側にも逆転の目が生まれます。",
    cards: ["voidmirror", "zero_mirror"],
  },
];

function Tutorial() {
  const [step, setStep] = useState(0);
  const p = useProfile();
  const navigate = useNavigate();
  const s = STEPS[step]!;
  const last = step === STEPS.length - 1;

  return (
    <main className="min-h-screen bg-background px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <Link to="/" className="text-xs text-muted-foreground hover:text-foreground">
          ← ホーム
        </Link>
        <h1 className="mt-4 text-3xl font-black text-foreground">チュートリアル</h1>

        <div className="mt-6 flex gap-1">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={
                "h-1 flex-1 rounded " + (i <= step ? "bg-primary" : "bg-muted")
              }
            />
          ))}
        </div>

        <section className="mt-8 rounded-xl border border-border bg-card/60 p-6">
          <h2 className="text-xl font-bold text-card-foreground">{s.title}</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
          {s.cards.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-3">
              {s.cards.map((id) => (
                <GameCard key={id} card={getCard(id)} size="sm" />
              ))}
            </div>
          )}
        </section>

        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={() => setStep((v) => Math.max(0, v - 1))}
            disabled={step === 0}
            className="rounded-md border border-input px-4 py-2 text-sm disabled:opacity-40"
          >
            戻る
          </button>
          {last ? (
            <button
              onClick={() => {
                completeTutorial();
                navigate({ to: "/starter" });
              }}
              className="rounded-md bg-primary px-5 py-2 text-sm font-bold text-primary-foreground hover:bg-primary/90"
            >
              {p.tutorialDone ? "スターター選択へ" : "修了してスターターを選ぶ（+100鏡片）"}
            </button>
          ) : (
            <button
              onClick={() => setStep((v) => v + 1)}
              className="rounded-md bg-primary px-5 py-2 text-sm font-bold text-primary-foreground"
            >
              次へ
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
