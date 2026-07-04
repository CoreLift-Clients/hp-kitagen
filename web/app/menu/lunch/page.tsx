import Image from "next/image";
import { Utensils } from "lucide-react";
import Link from "next/link";
import { getMenusForLunch, groupByCategorySub } from "../../lib/menus";
import { listDocuments } from "../../lib/adminDocuments";
import ImageGallery from "../../components/ImageGallery";
import { LUNCH_SUSPENDED, LUNCH_SUSPENDED_NOTICE } from "../../lib/businessHours";
import { pageMetadata } from "../../lib/seo";

export const metadata = pageMetadata({
  title: "ランチメニュー｜きたげん",
  description: "きたげんのランチメニューをご覧いただけます。",
  path: "/menu/lunch",
});

function SectionHeading({ label, title }: { label: string; title: string }) {
  return (
    <div className="mb-10">
      <p className="text-[10px] tracking-[0.45em] text-accent/80 mb-2">{label}</p>
      <h2 className="text-xl font-bold text-foreground">{title}</h2>
      <div className="flex items-center gap-3 mt-3">
        <div className="w-8 h-px bg-accent/50" />
        <div className="w-1 h-1 rounded-full bg-accent/60" />
        <div className="w-8 h-px bg-accent/50" />
      </div>
    </div>
  );
}

function MenuItemRow({
  name,
  description,
  price,
  isNew,
}: {
  name:         string;
  description?: string;
  price?:       string;
  isNew?:       boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-4 border-b border-border/70 last:border-0 group">
      <div className="flex-1 min-w-0 flex flex-col">
        {isNew && (
          <span className="text-[10px] font-bold tracking-widest text-amber-600 leading-none mb-1">
            NEW
          </span>
        )}
        <p className="font-medium text-foreground text-sm leading-snug group-hover:text-accent transition-colors duration-200">
          {name}
        </p>
        {description && (
          <p className="text-xs text-muted mt-0.5 leading-relaxed">{description}</p>
        )}
      </div>
      {price && (
        <p className="text-sm text-accent font-medium shrink-0 tabular-nums">{price}</p>
      )}
    </div>
  );
}

export default async function LunchMenuPage() {
  const [allItems, lunchDocs] = await Promise.all([
    getMenusForLunch(),
    listDocuments("lunch"),
  ]);
  const galleryImages = lunchDocs
    .filter((d) => d.isActive && d.resourceType === "image")
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((d) => ({ url: d.fileUrl, alt: d.title }));
  const foodSections = groupByCategorySub(allItems.filter((i) => i.category_main === "food"));
  const hasItems = allItems.length > 0;

  return (
    <div className="min-h-screen">

      {/* ── ページヘッダー ─────────────────────────────────── */}
      <section className="section-warm border-b border-border py-16 px-4 text-center">
        <p className="text-[10px] tracking-[0.5em] text-accent/80 mb-3">LUNCH</p>
        <h1 className="text-4xl font-bold text-foreground mb-4">ランチメニュー</h1>
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-8 h-px bg-accent/50" />
          <div className="w-1 h-1 rounded-full bg-accent/70" />
          <div className="w-8 h-px bg-accent/50" />
        </div>
        {/* ランチ臨時休業の告知（再開時は lib/businessHours.ts の LUNCH_SUSPENDED を false に） */}
        {LUNCH_SUSPENDED && (
          <p className="text-sm text-accent/90 mb-3 leading-relaxed">
            ※ {LUNCH_SUSPENDED_NOTICE}
          </p>
        )}
        <Link href="/menu/dinner" className="text-xs text-accent/70 hover:text-accent transition-colors duration-200">
          ディナーメニューはこちら →
        </Link>
      </section>

      {/* ── ランチメニュー ─────────────────────────────────── */}
      {hasItems ? (
        <section className="py-16 px-4 section-light">
          <div className="max-w-3xl mx-auto">
            <SectionHeading label="LUNCH" title="ランチメニュー" />
            <div className="space-y-10">
              {foodSections.map((sec) => (
                <div key={sec.heading}>
                  <h3 className="text-xs tracking-widest text-muted mb-1 uppercase">{sec.heading}</h3>
                  <div className="bg-background rounded-xl border border-border px-5">
                    {sec.items.map((item) => (
                      <MenuItemRow
                        key={item.id}
                        name={item.name}
                        description={item.description}
                        price={item.price}
                        isNew={item.isNew}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : (
        <section className="py-24 px-4 section-light">
          <div className="max-w-md mx-auto text-center">
            <div className="flex items-center justify-center mb-8">
              <Utensils size={32} strokeWidth={1.2} className="text-accent/40" />
            </div>
            <p className="text-[10px] tracking-[0.45em] text-accent/70 mb-4">COMING SOON</p>
            <h2 className="text-xl font-bold mb-4">ランチメニューを準備中です</h2>
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-8 h-px bg-accent/40" />
              <div className="w-1 h-1 rounded-full bg-accent/50" />
              <div className="w-8 h-px bg-accent/40" />
            </div>
            <p className="text-sm text-muted leading-[2.0]">
              ランチの詳細メニューは現在準備中です。<br />
              最新情報はInstagramまたは店頭にてご確認ください。
            </p>
          </div>
        </section>
      )}

      {/* ── メニュー画像ギャラリー ───────────────────────────── */}
      {galleryImages.length > 0 && (
        <section className="py-16 px-4 section-warm border-t border-border">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <p className="text-xs tracking-[0.4em] text-accent/80 mb-3">MENU</p>
              <h2 className="text-xl font-bold text-foreground">ランチメニューを見る</h2>
            </div>
            <ImageGallery images={galleryImages} />
          </div>
        </section>
      )}

    </div>
  );
}
