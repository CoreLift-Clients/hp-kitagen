import { pageMetadata } from "../../lib/seo";
import BreadcrumbJsonLd from "../../components/BreadcrumbJsonLd";
import PageHeading from "../../components/PageHeading";
import { LUNCH_SUSPENDED, dinnerTimeLabel } from "../../lib/businessHours";
import Specialties from "../../components/scenes/Specialties";
import TakeoutNote from "../../components/TakeoutNote";
import { getSpecialtyCards } from "../../content";

// 明朝体（Noto Serif JP）。名物の欄（縦書きの見出し・小見出し・カードの番号）のために、このページでも読み込む。
// 太さはトップと同じく 500・700 だけ
import "@fontsource/noto-serif-jp/500.css";
import "@fontsource/noto-serif-jp/700.css";
// 筆の字（佑字 朴 400）。名物のカードの品名だけに使う（globals.css の font-brush）。読み込むのはこのページだけ
import "@fontsource/yuji-boku/400.css";

// title・description・パンくず（BreadcrumbJsonLd）は「ディナーメニュー」のまま（ページの見出しは「お品書き」）。
// 「メニュー」で探す人が多く、ヘッダーの項目名も「メニュー」なので、検索結果とタブでは今の名前を残す
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

      {/* ── ページヘッダー（店舗情報のページと同じ帯・同じ見出しの形。components/PageHeading.tsx） ──────────
           見出しは「お品書き」。添え書きは営業時間（lib/businessHours.ts の dinnerTimeLabel()）。
           その下に、小さめの字で注意書き。ランチ休止中のお知らせは LUNCH_SUSPENDED が true のときだけ出す
           （再開時は lib/businessHours.ts の LUNCH_SUSPENDED を false にするだけで消える）。
           以前ここにあった、ランチのご案内の角の丸い囲み（Instagram への案内）は外した（Instagram は店舗情報・フッターから） */}
      <PageHeading title="お品書き" lead={dinnerTimeLabel()}>
        <div className="mt-3 space-y-0.5 text-xs md:text-sm text-muted/90 leading-relaxed">
          <p>仕入れによって、内容が変わることがあります。</p>
          {LUNCH_SUSPENDED && <p>ランチは、しばらくお休みしています。</p>}
        </div>
      </PageHeading>

      {/* ── 名物・おすすめ（料理6品・お飲みもの3つの、イラストのカード）────────────
           トップの名物の場面の入口「お品書きを見る →」の行き先なので、ページのいちばん上に置く。
           id="recommend" は、この欄への飛び先として残している（今は、ページの中にもほかのページにも、ここへのリンクは無い）。
           以前は、この上に目次の帯（名物・おすすめ／フード／ドリンク）と、この下に「フード」「ドリンク」の欄があったが、
           中身が空（「メニューは準備中です」）だったので外した。項目が1つになるので目次の帯も外した。
           中身と並べ方は components/scenes/Specialties.tsx。
           背景は section-deep：上のページヘッダー（section-warm）と色を変える。この下はフッター。
           テイクアウトのご案内（components/TakeoutNote.tsx。id="takeout"）は、この欄の「料理」のすぐ下・「お飲みもの」の前に入れる。
           以前は別のページ（/takeout）とこの欄の下の案内があったが、テイクアウトのメニューは店内と同じなので、ここにまとめた
           （/takeout は next.config.ts の redirects で /menu/dinner#takeout へ転送）。
           以前ここの下にあった、写真の枠のカードの「名物・おすすめ」の欄は外した。
           カードの部品は components/RecommendCard.tsx、品の一覧は lib/recommendedMenu.ts に残している
           （料理の写真がそろったときに使えるように。今はどこからも使っていない） */}
      <Specialties id="recommend" tone="deep" items={specialtyCards} afterFood={<TakeoutNote />} />

    </div>
  );
}
