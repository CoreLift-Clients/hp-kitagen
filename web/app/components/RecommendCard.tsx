import Image from "next/image";
import { Utensils } from "lucide-react";
import type { RecommendedItem } from "../lib/recommendedMenu";

// ─── 名物・おすすめカード（写真の枠のカード）───
// 以前ディナーメニュー（app/menu/dinner/page.tsx）の「名物・おすすめ」の欄で使っていたカード。
// 欄はジグザグの名物（components/scenes/Specialties.tsx）にまとめたので外したが、
// 料理の写真がそろったときに使えるよう、部品だけ残している（今はどこからも使っていない）。
// 品の一覧は lib/recommendedMenu.ts の RECOMMENDED_ITEMS、値段は resolveRecommendedPrice で引く。
// 使っていたときの並べ方（参考）：
//   名物（featured）… grid sm:grid-cols-2 gap-5 md:gap-6 で大きめに
//   おすすめ        … grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 で小さめに

// 名物・おすすめカード（写真は後入れ。無い間はプレースホルダー）
export default function RecommendCard({
  item,
  price,
  featured = false,
}: {
  item: RecommendedItem;
  price?: string;
  featured?: boolean;
}) {
  return (
    <article
      className={`group overflow-hidden bg-background/70 shadow-[0_1px_3px_rgba(90,65,30,0.05)] transition-all duration-300 hover:-translate-y-0.5 ${
        featured
          ? "rounded-2xl border-2 border-accent/40 hover:border-accent/60"
          : "rounded-xl border border-border hover:border-accent/40"
      }`}
    >
      {/* 写真枠（4:3）。hasPhoto が true になると写真に切り替わる */}
      <div className="relative aspect-[4/3] overflow-hidden bg-card-bg">
        {item.hasPhoto ? (
          <Image
            src={item.photo}
            alt={item.alt}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            sizes={featured ? "(max-width: 640px) 100vw, 50vw" : "(max-width: 640px) 50vw, 33vw"}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5">
            <Utensils size={featured ? 30 : 24} strokeWidth={1.2} className="text-accent/25" />
            <span className="text-[10px] tracking-[0.2em] text-muted/50">写真準備中</span>
          </div>
        )}

        {/* 名物バッジ */}
        {item.badge && (
          <span className="absolute top-3 left-3 rounded-full bg-accent px-3 py-1 text-[10px] md:text-xs font-bold text-white shadow-sm">
            {item.badge}
          </span>
        )}
      </div>

      <div className={featured ? "p-5 md:p-6" : "p-4"}>
        <div className="flex items-start justify-between gap-3">
          <h3
            className={`leading-snug ${
              featured ? "text-lg md:text-xl font-bold" : "text-sm md:text-base font-semibold"
            }`}
          >
            {item.name}
          </h3>
          {price && (
            <span
              className={`shrink-0 text-accent font-medium tabular-nums ${
                featured ? "text-base md:text-lg" : "text-sm md:text-base"
              }`}
            >
              {price}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
