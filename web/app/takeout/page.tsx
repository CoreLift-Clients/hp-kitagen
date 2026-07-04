import { Phone } from "lucide-react";
import { getMenusForTakeout, groupByCategorySub } from "../lib/menus";
import { listDocuments } from "../lib/adminDocuments";
import ImageGallery from "../components/ImageGallery";
import BreadcrumbJsonLd from "../components/BreadcrumbJsonLd";
import SectionInner from "../components/SectionInner";
import { PHONE } from "../lib/contact";
import { pageMetadata } from "../lib/seo";

export const metadata = pageMetadata({
  title: "テイクアウト｜きたげん",
  description: "きたげんの人気メニューをご自宅でもお楽しみいただけます。お電話でのご注文も可能です。",
  path: "/takeout",
});

type CategorySection = {
  heading: string;
  items: { id: string; name: string; description?: string; price?: string }[];
};

// 和紙テーマに馴染むカード枠（dinner頁と共通のスケール感）
const CARD =
  "rounded-2xl border border-border bg-background/70 p-6 md:p-8 shadow-[0_1px_2px_rgba(90,65,30,0.04)]";

// セクション見出し（dinner頁と共通のスケール）
function SectionLabel({ en, ja }: { en: string; ja: string }) {
  return (
    <div className="mb-8 md:mb-10">
      <p className="text-[10px] md:text-[11px] tracking-[0.55em] text-accent/70 mb-2">{en}</p>
      <h2 className="text-3xl md:text-4xl font-bold">{ja}</h2>
    </div>
  );
}

// カテゴリ（サブカテゴリ）見出し — accent色でしっかり立てる（dinnerと共通）
function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-base md:text-lg font-bold text-accent-dark mb-3 pb-2 border-b border-accent/25">
      {children}
    </h3>
  );
}

// 品名と価格をリーダー線（点線）でつなぐ1行（dinnerと共通）
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

// カテゴリ表（サブカテゴリごとに2カラム組版）。
// category_sub が空（＝1カテゴリのみ・未設定）の場合は見出しを出さず、
// 品目だけを2カラムのリーダー線で並べる（破綻しない）。
//
// ※ 名物（しゅうまい・餃子等）を写真カードで目立たせたくなった場合は、
//   dinner頁の RecommendCard 様式を流用してこの表の上に別セクションを足す余地あり。
//   今回はテイクアウトの実データ（display=takeout）のカテゴリ表示に徹する。
function MenuTable({ sections }: { sections: CategorySection[] }) {
  return (
    <div className={`${CARD} space-y-8 md:space-y-10`}>
      {sections.map((sec, idx) => (
        <div key={sec.heading || `section-${idx}`}>
          {sec.heading && <SubHeading>{sec.heading}</SubHeading>}
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

export default async function TakeoutPage() {
  const [items, takeoutDocs] = await Promise.all([
    getMenusForTakeout(),
    listDocuments("takeout"),
  ]);

  const galleryDocs = takeoutDocs
    .filter((d) => d.isActive && d.resourceType === "image")
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const galleryImages = galleryDocs.map((d, i) => ({
    url: d.fileUrl,
    // alt は管理画面のドキュメント名を流用。未入力時は内容が伝わる説明文にフォールバック。
    alt:
      d.title.trim() ||
      (galleryDocs.length > 1
        ? `きたげんのテイクアウトメニュー表（${i + 1}枚目）`
        : "きたげんのテイクアウトメニュー表"),
  }));

  const menuSections = groupByCategorySub(items);

  return (
    <div className="min-h-screen">
      <BreadcrumbJsonLd
        items={[
          { name: "トップ", path: "/" },
          { name: "テイクアウト", path: "/takeout" },
        ]}
      />

      {/* ── ページヘッダー（案内文もここに集約し、間延びを解消） ───── */}
      <section className="section-warm border-b border-border py-16 md:py-20 text-center">
        <SectionInner>
          <p className="text-[10px] md:text-[11px] tracking-[0.5em] text-accent/80 mb-3">TAKEOUT</p>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">テイクアウト</h1>
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-px bg-accent/50" />
            <div className="w-1 h-1 rounded-full bg-accent/70" />
            <div className="w-8 h-px bg-accent/50" />
          </div>
          <p className="text-sm md:text-base text-muted leading-relaxed">
            きたげんの人気メニューをご自宅でも。
            <br className="sm:hidden" />
            お電話でのご注文も可能です。
          </p>
        </SectionInner>
      </section>

      {/* ── テイクアウトメニュー ──────────────────────────────── */}
      <section className="section-light py-24 md:py-28">
        <SectionInner>
          <SectionLabel en="MENU" ja="テイクアウトメニュー" />

          {menuSections.length > 0 ? (
            <MenuTable sections={menuSections} />
          ) : (
            <div className={`${CARD} text-center`}>
              <p className="text-sm md:text-base text-muted leading-relaxed">
                ただいまテイクアウトメニューを準備中です。<br />
                下のメニュー表、またはお電話にてご確認ください。
              </p>
            </div>
          )}

          <p className="text-xs md:text-sm text-muted text-center mt-6 leading-relaxed">
            ※ 表示価格は目安です。内容・サイズにより前後する場合がございます。<br />
            この他にもテイクアウトメニューがございます。詳細は下のメニュー表をご確認ください。
          </p>
        </SectionInner>
      </section>

      {/* ── ご注文方法（電話CTA） ─────────────────────────────── */}
      <section className="section-warm py-24 md:py-28">
        <SectionInner>
          <SectionLabel en="ORDER" ja="ご注文方法" />

          <div className={`${CARD} max-w-xl mx-auto text-center`}>
            <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-border/60 bg-card-bg">
              <Phone size={20} strokeWidth={1.5} className="text-accent" />
            </div>
            <p className="text-sm md:text-base text-muted mb-4">お電話でご注文ください</p>
            <a
              href={"tel:" + PHONE}
              className="block text-3xl md:text-4xl font-bold tracking-wider text-foreground hover:text-accent transition-colors duration-200 tabular-nums"
            >
              {PHONE}
            </a>
            <p className="text-xs md:text-sm text-muted mt-3">タップで発信できます</p>
            <div className="border-t border-border/40 mt-6 pt-6 text-xs md:text-sm text-muted leading-relaxed">
              テイクアウトのご注文受付は、通常の営業時間内となります。<br />
              お時間に余裕を持ってご連絡いただけますと幸いです。
            </div>
          </div>
        </SectionInner>
      </section>

      {/* ── 実際のメニュー表を見る（撮影画像ギャラリー） ──────────── */}
      {galleryImages.length > 0 && (
        <section className="section-light border-t border-border py-24 md:py-28">
          <SectionInner>
            <div className="mb-8 md:mb-10">
              <p className="text-[10px] md:text-[11px] tracking-[0.55em] text-accent/70 mb-2">MENU</p>
              <h2 className="text-3xl md:text-4xl font-bold">実際のメニュー表を見る</h2>
              <p className="text-sm md:text-base text-muted mt-4">
                店頭のテイクアウトメニュー表を撮影したものです。タップで拡大できます。
              </p>
            </div>
            <ImageGallery images={galleryImages} />
          </SectionInner>
        </section>
      )}

    </div>
  );
}
