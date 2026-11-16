import Link from "next/link";
import { ShoppingBag, ArrowRight } from "lucide-react";
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

export const metadata = pageMetadata({
  title: "ディナーメニュー｜きたげん",
  description: "きたげんのディナーメニュー。名物の料理とお飲みものをご覧いただけます。",
  path: "/menu/dinner",
});

export default async function DinnerMenuPage() {
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

      {/* ── 名物・おすすめ（料理6品・お飲みもの3つの、イラストのカード）────────────
           トップの名物の場面の入口「お品書きを見る →」の行き先なので、ページのいちばん上に置く。
           id="recommend" は、この欄への飛び先として残している（今は、ページの中にもほかのページにも、ここへのリンクは無い）。
           以前は、この上に目次の帯（名物・おすすめ／フード／ドリンク）と、この下に「フード」「ドリンク」の欄があったが、
           中身が空（「メニューは準備中です」）だったので外した。項目が1つになるので目次の帯も外した。
           中身と並べ方は components/scenes/Specialties.tsx。
           背景は section-deep：上のページヘッダー（section-warm）・下のテイクアウトのご案内（section-light）と色を変える。
           以前ここの下にあった、写真の枠のカードの「名物・おすすめ」の欄は外した。
           カードの部品は components/RecommendCard.tsx、品の一覧は lib/recommendedMenu.ts に残している
           （料理の写真がそろったときに使えるように。今はどこからも使っていない） */}
      <Specialties id="recommend" tone="deep" items={specialtyCards} />

      {/* ── テイクアウトのご案内（/takeout への導線）─────────────
           以前は外した「名物・おすすめ」の欄のいちばん下にあった。欄を外したので、ここに単独で置く。
           背景は section-light：上の名物（section-deep）と色を変える。この下はフッター */}
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
    </div>
  );
}
