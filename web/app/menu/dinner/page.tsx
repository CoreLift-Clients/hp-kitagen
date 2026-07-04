import Image from "next/image";
import Link from "next/link";
import { Utensils, ShoppingBag, ArrowRight } from "lucide-react";
import { getMenusForDinner, groupByCategorySub } from "../../lib/menus";
import { listDocuments } from "../../lib/adminDocuments";
import { pageMetadata } from "../../lib/seo";
import ImageGallery from "../../components/ImageGallery";
import SectionInner from "../../components/SectionInner";
import { LUNCH_SUSPENDED } from "../../lib/businessHours";
import {
  RECOMMENDED_ITEMS,
  resolveRecommendedPrice,
  type RecommendedItem,
} from "../../lib/recommendedMenu";

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
  "ジャパニーズジン",
  "ノンアルコール",
  "ソフトドリンク",
] as const;

type CategorySection = {
  heading: string;
  items: { id: string; name: string; description?: string; price?: string }[];
};

function sortDrinkSections(sections: CategorySection[]): CategorySection[] {
  return [...sections].sort((a, b) => {
    const ai = DRINK_CATEGORY_ORDER.indexOf(a.heading as (typeof DRINK_CATEGORY_ORDER)[number]);
    const bi = DRINK_CATEGORY_ORDER.indexOf(b.heading as (typeof DRINK_CATEGORY_ORDER)[number]);
    const aOrder = ai === -1 ? Infinity : ai;
    const bOrder = bi === -1 ? Infinity : bi;
    return aOrder - bOrder;
  });
}

export const metadata = pageMetadata({
  title: "ディナーメニュー｜きたげん",
  description: "きたげんのディナーフード・ドリンクメニューをご覧いただけます。",
  path: "/menu/dinner",
});

// 和紙テーマに馴染むカード枠（info頁と同じスケール感）
const CARD =
  "rounded-2xl border border-border bg-background/70 p-6 md:p-8 shadow-[0_1px_2px_rgba(90,65,30,0.04)]";

// セクション見出し（info頁と共通のスケール）
function SectionLabel({ en, ja }: { en: string; ja: string }) {
  return (
    <div className="mb-8 md:mb-10">
      <p className="text-[10px] md:text-[11px] tracking-[0.55em] text-accent/70 mb-2">{en}</p>
      <h2 className="text-3xl md:text-4xl font-bold">{ja}</h2>
    </div>
  );
}

// カテゴリ（サブカテゴリ）見出し — accent色でしっかり立てる
function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-base md:text-lg font-bold text-accent-dark mb-3 pb-2 border-b border-accent/25">
      {children}
    </h3>
  );
}

// 品名と価格をリーダー線（点線）でつなぐ1行
function LeaderRow({
  name,
  description,
  price,
}: {
  name: string;
  description?: string;
  price?: string;
}) {
  return (
    <div className="py-2.5">
      <div className="flex items-baseline gap-2">
        <span className="font-medium text-foreground text-sm md:text-base leading-snug">
          {name}
        </span>
        <span
          className="flex-1 min-w-[1rem] translate-y-[-0.2em] border-b border-dotted border-border/80"
          aria-hidden
        />
        {price && (
          <span className="shrink-0 text-sm md:text-base text-accent font-medium tabular-nums">
            {price}
          </span>
        )}
      </div>
      {description && (
        <p className="text-xs md:text-sm text-muted mt-1 leading-relaxed">{description}</p>
      )}
    </div>
  );
}

// フード／ドリンクのカテゴリ表（サブカテゴリごとに2カラム組版）
function MenuTable({ sections }: { sections: CategorySection[] }) {
  return (
    <div className={`${CARD} space-y-8 md:space-y-10`}>
      {sections.map((sec) => (
        <div key={sec.heading}>
          <SubHeading>{sec.heading}</SubHeading>
          <div className="sm:grid sm:grid-cols-2 sm:gap-x-10 lg:gap-x-14">
            {sec.items.map((item) => (
              <LeaderRow
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
  );
}

// 名物・おすすめカード（写真は後入れ。無い間はプレースホルダー）
function RecommendCard({
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

export default async function DinnerMenuPage() {
  const [allItems, dinnerDocs] = await Promise.all([
    getMenusForDinner(),
    listDocuments("dinner"),
  ]);

  const galleryImages = dinnerDocs
    .filter((d) => d.isActive && d.resourceType === "image")
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((d) => ({ url: d.fileUrl, alt: d.title }));

  const foodSections = groupByCategorySub(allItems.filter((i) => i.category_main === "food"));
  const drinkSections = sortDrinkSections(
    groupByCategorySub(allItems.filter((i) => i.category_main === "drink")),
  );

  // 名物・おすすめの価格はAPIメニューから品名一致で引く
  const featuredItems = RECOMMENDED_ITEMS.filter((i) => i.featured);
  const otherItems = RECOMMENDED_ITEMS.filter((i) => !i.featured);
  const priceOf = (item: RecommendedItem) => resolveRecommendedPrice(item, allItems);

  return (
    <div className="min-h-screen">

      {/* ── ページヘッダー ─────────────────────────────────── */}
      <section className="section-warm border-b border-border py-16 md:py-20 text-center">
        <SectionInner>
          <p className="text-[10px] md:text-[11px] tracking-[0.5em] text-accent/80 mb-3">DINNER</p>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">ディナーメニュー</h1>
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-px bg-accent/50" />
            <div className="w-1 h-1 rounded-full bg-accent/70" />
            <div className="w-8 h-px bg-accent/50" />
          </div>
          <p className="text-sm md:text-base text-muted mb-1">
            ディナータイム：17:00〜22:00（L.O. 21:30）
          </p>
          <p className="text-xs md:text-sm text-muted/70 mb-8">
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
        </SectionInner>
      </section>

      {/* ── スクロールナビ（sticky・ヘッダー h-16 の直下に吸着） ── */}
      <div className="sticky top-16 z-30 bg-background/95 backdrop-blur border-b border-border">
        <SectionInner>
          <div className="flex">
            {[
              { href: "#recommend", label: "名物・おすすめ" },
              { href: "#food", label: "フード" },
              { href: "#drink", label: "ドリンク" },
            ].map(({ href, label }) => (
              <a
                key={href}
                href={href}
                className="flex-1 text-center py-3.5 md:py-4 text-sm md:text-base text-muted hover:text-accent transition-colors border-b-2 border-transparent hover:border-accent/60"
              >
                {label}
              </a>
            ))}
          </div>
        </SectionInner>
      </div>

      {/* ── ① 名物・おすすめ ───────────────────────────────── */}
      <section id="recommend" className="section-light scroll-mt-32 py-16 md:py-20">
        <SectionInner>
          <SectionLabel en="RECOMMEND" ja="名物・おすすめ" />

          {/* 名物（大きめ・2カラム） */}
          <div className="grid sm:grid-cols-2 gap-5 md:gap-6 mb-6 md:mb-8">
            {featuredItems.map((item) => (
              <RecommendCard key={item.name} item={item} price={priceOf(item)} featured />
            ))}
          </div>

          {/* おすすめ（小さめ・2〜3カラム） */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {otherItems.map((item) => (
              <RecommendCard key={item.name} item={item} price={priceOf(item)} />
            ))}
          </div>

          {/* ── テイクアウトのご案内（/takeout への導線） ─────────── */}
          <Link
            href="/takeout"
            className="group mt-10 md:mt-12 flex items-center gap-4 md:gap-5 rounded-2xl border border-accent/40 bg-accent/[0.06] p-5 md:p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/60 hover:bg-accent/10"
          >
            <div className="flex h-11 w-11 md:h-12 md:w-12 shrink-0 items-center justify-center rounded-xl border border-accent/30 bg-background/70">
              <ShoppingBag size={20} strokeWidth={1.6} className="text-accent" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] md:text-[11px] tracking-[0.35em] text-accent/70 mb-1">TAKEOUT</p>
              <h3 className="text-base md:text-lg font-bold text-foreground">お持ち帰りも承っています</h3>
              <p className="text-xs md:text-sm text-muted mt-1 leading-relaxed">
                人気メニューをご自宅でも。テイクアウト専用メニューをお電話でご注文いただけます。
              </p>
            </div>
            <ArrowRight
              size={18}
              strokeWidth={1.8}
              className="hidden sm:block shrink-0 text-accent transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </SectionInner>
      </section>

      {/* ── ② フード ───────────────────────────────────────── */}
      {foodSections.length > 0 && (
        <section id="food" className="section-warm scroll-mt-32 py-16 md:py-20">
          <SectionInner>
            <SectionLabel en="FOOD" ja="フード" />
            <MenuTable sections={foodSections} />
          </SectionInner>
        </section>
      )}

      {/* ── ③ ドリンク ─────────────────────────────────────── */}
      {drinkSections.length > 0 && (
        <section id="drink" className="section-light scroll-mt-32 py-16 md:py-20">
          <SectionInner>
            <SectionLabel en="DRINK" ja="ドリンク" />
            <MenuTable sections={drinkSections} />
          </SectionInner>
        </section>
      )}

      {/* ── ④ 実際のメニュー表を見る（撮影画像ギャラリー） ──────── */}
      {galleryImages.length > 0 && (
        <section className="section-warm border-t border-border py-16 md:py-20">
          <SectionInner>
            <div className="mb-8 md:mb-10">
              <p className="text-[10px] md:text-[11px] tracking-[0.55em] text-accent/70 mb-2">MENU</p>
              <h2 className="text-3xl md:text-4xl font-bold">実際のメニュー表を見る</h2>
              <p className="text-sm md:text-base text-muted mt-4">
                店頭のメニュー表を撮影したものです。タップで拡大できます。
              </p>
            </div>
            <ImageGallery images={galleryImages} />
          </SectionInner>
        </section>
      )}

    </div>
  );
}
