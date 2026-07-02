import type { Metadata } from "next";
import Image from "next/image";
import { Utensils } from "lucide-react";
import { getMenusForDinner, getMenusForTop, groupByCategorySub } from "../../lib/menus";
import { listDocuments } from "../../lib/adminDocuments";
import ImageGallery from "../../components/ImageGallery";
import { LUNCH_SUSPENDED } from "../../lib/businessHours";

// ランチ営業のご案内で使用（info頁・構造化データと同じ公式アカウント）
const INSTAGRAM_URL = "https://www.instagram.com/izakaya_kitagen";

// ドリンクカテゴリの表示順（居酒屋として自然な並び）
const DRINK_CATEGORY_ORDER = [
  "生ビール",
  "瓶ビール",
  "ハイボール",
  "サワー",
  "果実酒",
  "梅酒",
  "日本酒",
  "焼酎",
  "ワイン",
  "ノンアル",
  "ソフトドリンク",
] as const;

type CategorySection = { heading: string; items: { id: string; name: string; description?: string; price?: string }[] };

function sortDrinkSections(sections: CategorySection[]): CategorySection[] {
  return [...sections].sort((a, b) => {
    const ai = DRINK_CATEGORY_ORDER.indexOf(a.heading as typeof DRINK_CATEGORY_ORDER[number]);
    const bi = DRINK_CATEGORY_ORDER.indexOf(b.heading as typeof DRINK_CATEGORY_ORDER[number]);
    const aOrder = ai === -1 ? Infinity : ai;
    const bOrder = bi === -1 ? Infinity : bi;
    return aOrder - bOrder;
  });
}

export const metadata: Metadata = {
  title: "ディナーメニュー｜きたげん",
  description: "きたげんのディナーフード・ドリンクメニューをご覧いただけます。",
};

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
}: {
  name:         string;
  description?: string;
  price?:       string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-4 border-b border-border/70 last:border-0 group">
      <div className="flex-1 min-w-0">
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

function MenuCategorySection({
  id,
  label,
  title,
  sections,
}: {
  id:       string;
  label:    string;
  title:    string;
  sections: CategorySection[];
}) {
  return (
    <section id={id} className="py-16 px-4 section-warm scroll-mt-28">
      <div className="max-w-3xl mx-auto">
        <SectionHeading label={label} title={title} />
        <div className="space-y-10">
          {sections.map((sec) => (
            <div key={sec.heading}>
              <h3 className="text-xs tracking-widest text-muted mb-1 uppercase">{sec.heading}</h3>
              <div className="bg-background rounded-xl border border-border px-5">
                {sec.items.map((item) => (
                  <MenuItemRow
                    key={item.id}
                    name={item.name}
                    description={item.description}
                    price={item.price}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default async function DinnerMenuPage() {
  const [allItems, popularItems, dinnerDocs] = await Promise.all([
    getMenusForDinner(),
    getMenusForTop(),
    listDocuments("dinner"),
  ]);
  const galleryImages = dinnerDocs
    .filter((d) => d.isActive && d.resourceType === "image")
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((d) => ({ url: d.fileUrl, alt: d.title }));
  const foodSections  = groupByCategorySub(allItems.filter((i) => i.category_main === "food"));
  const drinkSections = sortDrinkSections(
    groupByCategorySub(allItems.filter((i) => i.category_main === "drink")),
  );

  return (
    <div className="min-h-screen">

      {/* ── ページヘッダー ─────────────────────────────────── */}
      <section className="section-warm border-b border-border py-16 px-4 text-center">
        <p className="text-[10px] tracking-[0.5em] text-accent/80 mb-3">DINNER</p>
        <h1 className="text-4xl font-bold text-foreground mb-4">ディナーメニュー</h1>
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-8 h-px bg-accent/50" />
          <div className="w-1 h-1 rounded-full bg-accent/70" />
          <div className="w-8 h-px bg-accent/50" />
        </div>
        <p className="text-sm text-muted mb-1">
          ディナータイム：17:00〜22:00（L.O. 21:30）
        </p>
        <p className="text-xs text-muted/70 mb-6">
          ※ 仕入れ状況により内容が変わる場合があります。最新情報は店頭にてご確認ください。
        </p>

        {/* ── ランチ営業のご案内 ───────────────────────────────
             ランチは NAV から統合。営業状況は Instagram に集約して案内する。
             再開時は lib/businessHours.ts の LUNCH_SUSPENDED を false に。 */}
        <div className="max-w-md mx-auto rounded-lg border border-border bg-background/70 px-6 py-5 text-left">
          <p className="text-[10px] tracking-[0.35em] text-accent/70 mb-2">LUNCH</p>
          <p className="text-sm text-muted leading-[2.0]">
            {LUNCH_SUSPENDED
              ? "ランチ営業は、ただいま臨時休業とさせていただいております。再開の時期やその日の営業状況は、"
              : "ランチ営業の有無や、その日の営業状況は、"}
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent underline underline-offset-2 decoration-accent/40 hover:decoration-accent transition-colors"
            >
              Instagram
            </a>
            にてご案内しております。お手数ですが、ご来店前にご確認いただけますと幸いです。
          </p>
        </div>
      </section>

      {/* ── スクロールナビ ─────────────────────────────────── */}
      <div className="sticky top-[57px] z-30 bg-background border-b border-border">
        <div className="max-w-3xl mx-auto px-4 flex">
          {[
            { href: "#popular", label: "人気メニュー" },
            { href: "#food",    label: "フード"       },
            { href: "#drink",   label: "ドリンク"     },
          ].map(({ href, label }) => (
            <a
              key={href}
              href={href}
              className="flex-1 text-center py-4 text-sm text-muted hover:text-accent transition-colors border-b-2 border-transparent hover:border-accent/60"
            >
              {label}
            </a>
          ))}
        </div>
      </div>

      {/* ── 人気メニュー ───────────────────────────────────── */}
      <section id="popular" className="py-16 px-4 scroll-mt-28 section-light">
        <div className="max-w-3xl mx-auto">
          <SectionHeading label="POPULAR" title="人気メニュー" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {popularItems.map((item) => (
              <div
                key={item.id}
                className="group bg-card-bg rounded-xl border border-border overflow-hidden hover:-translate-y-1 hover:border-accent/50 transition-all duration-300"
              >
                <div className="h-36 bg-border/30 relative overflow-hidden">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                      sizes="(max-width: 640px) 100vw, 50vw"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Utensils size={28} strokeWidth={1.2} className="text-muted/30" />
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="font-bold text-foreground text-sm leading-snug">{item.name}</h3>
                    {item.price && (
                      <span className="text-sm text-accent font-medium shrink-0 tabular-nums">{item.price}</span>
                    )}
                  </div>
                  {item.description && (
                    <p className="text-xs text-muted leading-relaxed">{item.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <MenuCategorySection id="food"  label="FOOD"  title="フード"   sections={foodSections}  />
      <MenuCategorySection id="drink" label="DRINK" title="ドリンク" sections={drinkSections} />

      {/* ── メニュー画像ギャラリー ───────────────────────────── */}
      {galleryImages.length > 0 && (
        <section className="py-16 px-4 section-warm border-t border-border">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <p className="text-xs tracking-[0.4em] text-accent/80 mb-3">MENU</p>
              <h2 className="text-xl font-bold text-foreground">ディナーメニューを見る</h2>
            </div>
            <ImageGallery images={galleryImages} />
          </div>
        </section>
      )}

    </div>
  );
}
