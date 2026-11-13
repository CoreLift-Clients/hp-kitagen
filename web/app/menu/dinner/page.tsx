import Link from "next/link";
import { ShoppingBag, ArrowRight } from "lucide-react";
import { getMenusForDinner, groupByCategorySub } from "../../lib/menus";
import { pageMetadata } from "../../lib/seo";
import BreadcrumbJsonLd from "../../components/BreadcrumbJsonLd";
import SectionInner from "../../components/SectionInner";
import { INSTAGRAM_URL } from "../../lib/contact";
import { LUNCH_SUSPENDED, dinnerTimeLabel } from "../../lib/businessHours";
import Specialties from "../../components/scenes/Specialties";
import { getSpecialtyCards } from "../../content";

// 明朝体（Noto Serif JP）。名物の欄（縦書きの見出し・小見出し・カードの番号と品名）のために、このページでも読み込む。
// 太さはトップと同じく 500・700 だけ
import "@fontsource/noto-serif-jp/500.css";
import "@fontsource/noto-serif-jp/700.css";

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
function SectionLabel({ ja }: { ja: string }) {
  return (
    <div className="mb-8 md:mb-10">
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

// メニューのデータが空のときの案内（欄ごと消さずに、Instagram へ案内する）
function MenuPreparingNotice() {
  return (
    <div className={`${CARD} text-center`}>
      <p className="text-sm md:text-base text-muted leading-relaxed">
        メニューは準備中です。
        <br className="sm:hidden" />
        最新情報は
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent underline underline-offset-2 decoration-accent/40 hover:decoration-accent transition-colors"
        >
          Instagram
        </a>
        でお知らせしています。
      </p>
    </div>
  );
}

export default async function DinnerMenuPage() {
  const allItems = await getMenusForDinner();

  const foodSections = groupByCategorySub(allItems.filter((i) => i.category_main === "food"));
  const drinkSections = sortDrinkSections(
    groupByCategorySub(allItems.filter((i) => i.category_main === "drink")),
  );

  // 名物の欄（料理6品・お飲みもの3つのカード）の品名・ひとこと・値段は content/specialty-prices.ts から
  const specialtyCards = await getSpecialtyCards();

  return (
    <div className="min-h-screen">
      <BreadcrumbJsonLd
        items={[
          { name: "トップ", path: "/" },
          { name: "ディナーメニュー", path: "/menu/dinner" },
        ]}
      />

      {/* ── ページヘッダー ─────────────────────────────────── */}
      <section className="section-warm border-b border-border py-16 md:py-20 text-center">
        <SectionInner>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">ディナーメニュー</h1>
          <p className="text-sm md:text-base text-muted mb-1">
            ディナータイム：{dinnerTimeLabel()}
          </p>
          <p className="text-xs md:text-sm text-muted/90 mb-8">
            ※ 仕入れ状況により内容が変わる場合があります。最新情報は店頭にてご確認ください。
          </p>

          {/* ── ランチ営業のご案内 ───────────────────────────────
               ランチは NAV から統合。営業状況は Instagram に集約して案内する。
               再開時は lib/businessHours.ts の LUNCH_SUSPENDED を false に。 */}
          <div className="max-w-md mx-auto rounded-lg border border-border bg-background/70 px-6 py-5 text-left">
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

      {/* ── ① 名物・おすすめ（料理6品・お飲みもの3つの、イラストのカード）────────────
           トップの名物の場面の入口「お品書きを見る →」の行き先なので、ページのいちばん上に置く。
           目次の帯の「名物・おすすめ」（#recommend）の飛び先もここ。
           中身と並べ方は components/scenes/Specialties.tsx。
           背景は section-deep：上のページヘッダー（section-warm）・下のテイクアウトのご案内（section-light）と色を変える。
           以前ここの下にあった、写真の枠のカードの「名物・おすすめ」の欄は外した。
           カードの部品は components/RecommendCard.tsx、品の一覧は lib/recommendedMenu.ts に残している
           （料理の写真がそろったときに使えるように。今はどこからも使っていない） */}
      <Specialties id="recommend" tone="deep" items={specialtyCards} />

      {/* ── テイクアウトのご案内（/takeout への導線）─────────────
           以前は外した「名物・おすすめ」の欄のいちばん下にあった。欄を外したので、ここに単独で置く。
           背景は section-light：上の名物（section-deep）・下のフード（section-warm）と色を変える */}
      <section className="section-light py-12 md:py-16">
        <SectionInner>
          <Link
            href="/takeout"
            className="group flex items-center gap-4 md:gap-5 rounded-2xl border border-accent/40 bg-accent/[0.06] p-5 md:p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/60 hover:bg-accent/10"
          >
            <div className="flex h-11 w-11 md:h-12 md:w-12 shrink-0 items-center justify-center rounded-xl border border-accent/30 bg-background/70">
              <ShoppingBag size={20} strokeWidth={1.6} className="text-accent" />
            </div>
            <div className="min-w-0 flex-1">
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
      <section id="food" className="section-warm scroll-mt-32 py-16 md:py-20">
        <SectionInner>
          <SectionLabel ja="フード" />
          {foodSections.length > 0 ? (
            <MenuTable sections={foodSections} />
          ) : (
            <MenuPreparingNotice />
          )}
        </SectionInner>
      </section>

      {/* ── ③ ドリンク ─────────────────────────────────────── */}
      <section id="drink" className="section-light scroll-mt-32 py-16 md:py-20">
        <SectionInner>
          <SectionLabel ja="ドリンク" />
          {drinkSections.length > 0 ? (
            <MenuTable sections={drinkSections} />
          ) : (
            <MenuPreparingNotice />
          )}
        </SectionInner>
      </section>

    </div>
  );
}
