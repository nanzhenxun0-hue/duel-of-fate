import { cn } from "@/lib/utils";
import { RARITY_LABEL, RARITY_STYLE, type CardDef } from "@/data/cards";

interface Props {
  card: CardDef;
  size?: "sm" | "md";
  selected?: boolean;
  dimmed?: boolean;
  count?: number;
  foil?: boolean;
  serial?: string;
  onClick?: () => void;
  className?: string;
}

export function GameCard({
  card,
  size = "md",
  selected,
  dimmed,
  count,
  foil,
  serial,
  onClick,
  className,
}: Props) {
  const isUnit = card.type === "unit";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={cn(
        "relative flex flex-col rounded-lg border bg-card/80 p-2 text-left backdrop-blur transition",
        "shadow-[0_0_0_1px_rgba(255,255,255,0.03)]",
        size === "sm" ? "w-28 min-h-36" : "w-40 min-h-52",
        RARITY_STYLE[card.rarity],
        onClick && "hover:-translate-y-1 hover:shadow-lg cursor-pointer",
        selected && "ring-2 ring-amber-300 -translate-y-1",
        dimmed && "opacity-40 grayscale",
        foil && "bg-gradient-to-br from-fuchsia-500/20 via-sky-400/10 to-amber-300/20",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-1">
        <span
          className={cn(
            "font-semibold leading-tight text-card-foreground",
            size === "sm" ? "text-[11px]" : "text-sm",
          )}
        >
          {card.name}
        </span>
        <span className="shrink-0 rounded border px-1 text-[10px] font-bold">{card.rarity}</span>
      </div>

      <div className="mt-1 flex gap-1 text-[10px]">
        {card.costLight > 0 && (
          <span className="rounded bg-amber-300/20 px-1 text-amber-200">光{card.costLight}</span>
        )}
        {card.costShadow > 0 && (
          <span className="rounded bg-violet-400/20 px-1 text-violet-200">影{card.costShadow}</span>
        )}
        {card.costLight === 0 && card.costShadow === 0 && (
          <span className="rounded bg-muted px-1 text-muted-foreground">コスト0</span>
        )}
        <span className="rounded bg-muted px-1 text-muted-foreground">
          {isUnit ? "ユニット" : "術"}
        </span>
      </div>

      <p
        className={cn(
          "mt-1 flex-1 leading-snug text-muted-foreground",
          size === "sm" ? "text-[9px]" : "text-[11px]",
        )}
      >
        {card.text}
      </p>

      <div className="mt-1 flex items-end justify-between">
        <span className="text-[9px] text-muted-foreground">
          {card.series}・{RARITY_LABEL[card.rarity]}
        </span>
        {isUnit && (
          <span className="text-xs font-bold text-card-foreground">
            {card.atk} / {card.hp}
          </span>
        )}
      </div>

      {serial && <span className="mt-0.5 text-[9px] text-muted-foreground">No.{serial}</span>}
      {foil && (
        <span className="absolute -top-2 -right-2 rounded-full bg-fuchsia-400 px-1.5 py-0.5 text-[9px] font-bold text-black">
          箔押し
        </span>
      )}
      {count !== undefined && (
        <span className="absolute -top-2 -left-2 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
          ×{count}
        </span>
      )}
    </button>
  );
}
