import type { PublicAnnouncement } from "../lib/announcements";

interface Props {
  item: PublicAnnouncement;
}

/**
 * トップページ・お知らせページ共通のお知らせカード。
 * デザイン基準: トップページのお知らせセクション。
 */
export default function NewsCard({ item }: Props) {
  return (
    <div className="group relative bg-background rounded-lg overflow-hidden border border-border/50 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow hover:border-border/80">
      {/* 左アクセントライン */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent/35 transition-colors duration-300 group-hover:bg-accent/65" />
      <div className="px-7 py-6 md:px-9 md:py-7">
        {item.createdAt && (
          <p className="text-[10px] tracking-[0.4em] text-accent/75 mb-2.5 font-light">
            {new Date(item.createdAt).toLocaleDateString("ja-JP", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        )}
        <p className="font-semibold text-base md:text-lg text-foreground leading-snug mb-2">
          {item.title}
        </p>
        {item.body && (
          <p className="text-sm md:text-[15px] text-muted leading-relaxed">{item.body}</p>
        )}
      </div>
    </div>
  );
}
