import Image from "next/image";
import Link from "next/link";
import { OWNER_SECTIONS, OWNER_PHOTO, OWNER_PHOTO_ALT } from "../lib/owner";
import { pageMetadata } from "../lib/seo";
import BreadcrumbJsonLd from "../components/BreadcrumbJsonLd";
import PageHeading from "../components/PageHeading";
import { WashiSheet, WashiItem, BrushRule, WASHI_GRID, WASHI_LINK } from "../components/Washi";

// 明朝体（Noto Serif JP）。項目名（縦書き）と署名のために、このページでも読み込む（店舗情報のページと同じ 500・700）
import "@fontsource/noto-serif-jp/500.css";
import "@fontsource/noto-serif-jp/700.css";

export const metadata = pageMetadata({
  title: "店主紹介 | IZAKAYA きたげん",
  description:
    "桃谷で生まれ育った、居酒屋きたげんの店主より。みんなの居場所になる店を目指して。鉄鍋餃子や自家製しゅうまいへの想い、女性お一人でも入りやすい店づくりについてお話しします。",
  path: "/owner",
});

// ─── ページの作り：店舗情報のページと同じ「1枚の和紙」 ───
// ・ページの見出しの帯は共通の PageHeading（店舗情報・お品書きと同じ形・同じ余白）
// ・その下の地に、縦に長い1枚の和紙（components/Washi.tsx。店舗情報と共通の部品）
//   1) いちばん上に書き出しの文（大きめの字。md 以上は本文の列にそろえる）
//   2) 本文の項目（lib/owner.ts の OWNER_SECTIONS）。小見出しは店舗情報の項目名と同じく、md 以上は左に縦書き、
//      md より狭い画面は横書きで上に。項目のあいだは筆の細い横線1本（BrushRule）
//   3) いちばん下、右寄せに署名（明朝体。本文より少し大きく）
// ・和紙の下（ページの地）に、結びの文と、控えめな文字のリンク2つ（店舗情報の「地図アプリで開く」と同じ見せ方）
// ・本文の文は店主の言葉なので、一字も変えない（lib/owner.ts）

export default function OwnerPage() {
  const hasPhoto = OWNER_PHOTO.trim() !== "";

  return (
    <div className="min-h-screen">
      <BreadcrumbJsonLd
        items={[
          { name: "トップ", path: "/" },
          { name: "店主紹介", path: "/owner" },
        ]}
      />

      {/* ── ページヘッダー（店舗情報・お品書きのページと同じ帯。components/PageHeading.tsx） ── */}
      <PageHeading title="きたげんの店主より" lead="桃谷で、みんなの居場所になる店を。" />

      {/* ── 1枚の和紙（店主のあいさつ）と、和紙の下の結び ───────────── */}
      <WashiSheet
        after={
          <div className="mt-14 md:mt-20 text-center">
            <p className="text-sm md:text-base text-muted leading-[2.1]">
              気の向いたときに、ふらっと。
              <br />
              きたげんで、お待ちしています。
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-sm md:text-base">
              <Link href="/menu/dinner" className={WASHI_LINK}>
                お品書きを見る
              </Link>
              <Link href="/info" className={WASHI_LINK}>
                店舗情報を見る
              </Link>
            </div>
          </div>
        }
      >
        {/* 店主写真（フォルダ方式）。未設置の間は出さない。
            写真は web/public/images/owner/ に置き、app/lib/owner.ts の OWNER_PHOTO を設定すると、書き出しの文の上に出る */}
        {hasPhoto && (
          <figure className="pt-9 md:pt-12 lg:pt-14 flex flex-col items-center">
            <div className="relative w-44 sm:w-52 aspect-[3/4] overflow-hidden border border-border/60 bg-card-bg">
              <Image
                src={OWNER_PHOTO}
                alt={OWNER_PHOTO_ALT}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 176px, 208px"
                priority
              />
            </div>
          </figure>
        )}

        {/* 書き出しの文（大きめの字。md 以上は、縦書きの小見出しの列をあけて本文の列にそろえる） */}
        <div className={`pt-9 md:pt-12 lg:pt-14 ${WASHI_GRID}`}>
          <p className="md:col-start-2 text-lg md:text-xl font-medium text-foreground leading-[2] md:leading-[2.1] [word-break:auto-phrase]">
            はじめまして。
            <br className="hidden sm:block" />
            居酒屋きたげんの店主です。
          </p>
        </div>

        {/* 本文の項目（項目のあいだだけ、筆の細い横線） */}
        {OWNER_SECTIONS.map((section, i) => (
          <div key={section.heading}>
            {i > 0 && <BrushRule seed={30000 + i * 97} />}
            <WashiItem label={section.heading}>
              <div className="space-y-4">
                {section.body.map((text, j) => (
                  <p key={j}>{text}</p>
                ))}
              </div>
            </WashiItem>
          </div>
        ))}

        {/* 署名（右寄せ。明朝体、本文より少し大きく） */}
        <p className="pb-9 md:pb-12 lg:pb-14 text-right font-serif text-lg md:text-xl font-medium text-foreground tracking-[0.12em]">
          店主　北口 隆
        </p>
      </WashiSheet>
    </div>
  );
}
