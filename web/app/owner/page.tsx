import Image from "next/image";
import Link from "next/link";
import {
  OWNER_SECTIONS,
  OWNER_PULLQUOTE,
  OWNER_PHOTO,
  OWNER_PHOTO_ALT,
} from "../lib/owner";
import { pageMetadata } from "../lib/seo";
import BreadcrumbJsonLd from "../components/BreadcrumbJsonLd";

export const metadata = pageMetadata({
  title: "店主紹介 | IZAKAYA きたげん",
  description:
    "桃谷で生まれ育った、居酒屋きたげんの店主より。みんなの居場所になる店を目指して。鉄鍋餃子や自家製しゅうまいへの想い、女性お一人でも入りやすい店づくりについてお話しします。",
  path: "/owner",
});

// プルクオートを挿入するセクションの区切り位置（このインデックスのセクションの直後）。
// 本文の中盤に自然に置けるよう、想いを語ったセクションの後に差し込む。
const PULLQUOTE_AFTER_INDEX = 1;

export default function OwnerPage() {
  const hasPhoto = OWNER_PHOTO.trim() !== "";

  return (
    <div className="min-h-screen pt-16">
      <BreadcrumbJsonLd
        items={[
          { name: "トップ", path: "/" },
          { name: "店主紹介", path: "/owner" },
        ]}
      />

      {/* ── ページヘッダー ───────────────────────────────── */}
      <section className="section-warm py-16 px-4 text-center border-b border-foreground/10">
        <p className="text-[10px] tracking-[0.45em] text-accent/80 mb-2">OWNER</p>
        <h1 className="text-3xl font-bold leading-snug">きたげんの店主より</h1>
        <div className="flex items-center justify-center gap-3 mt-4">
          <div className="w-8 h-px bg-accent/50" />
          <div className="w-1 h-1 rounded-full bg-accent/70" />
          <div className="w-8 h-px bg-accent/50" />
        </div>
        <p className="text-sm text-muted mt-4">桃谷で、みんなの居場所になる店を。</p>
      </section>

      {/* ── 本文（縦長の読み物） ─────────────────────────── */}
      <section className="section-light py-16 md:py-20 px-4">
        <article className="max-w-2xl mx-auto">

          {/* 店主写真（フォルダ方式）。未設置の間は枠を出さず文章のみで成立させる。
              写真は web/public/images/owner/ に置き、app/lib/owner.ts の
              OWNER_PHOTO を設定すると表示される。 */}
          {hasPhoto && (
            <figure className="mb-12 flex flex-col items-center">
              <div className="relative w-44 sm:w-52 aspect-[3/4] rounded-lg overflow-hidden border border-border/60 shadow-[0_10px_30px_rgba(90,65,30,0.12)] bg-card-bg">
                <Image
                  src={OWNER_PHOTO}
                  alt={OWNER_PHOTO_ALT}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 176px, 208px"
                  priority
                />
              </div>
              <figcaption className="mt-4 text-xs text-muted/90 tracking-wide">
                IZAKAYA きたげん 店主
              </figcaption>
            </figure>
          )}

          {/* リード（あいさつ） */}
          <p className="text-lg md:text-xl font-medium text-foreground leading-[2] md:leading-[2.1] mb-3">
            はじめまして。
            <br className="hidden sm:block" />
            居酒屋きたげんの店主です。
          </p>

          {/* 装飾ライン */}
          <div className="flex items-center gap-3 my-8">
            <div className="w-10 h-px bg-accent/40" />
            <div className="w-1 h-1 rounded-full bg-accent/60" />
          </div>

          {/* 本文（見出し付きセクション）。話題のまとまりごとに区切って読ませる。 */}
          <div className="space-y-12">
            {OWNER_SECTIONS.map((section, i) => (
              <div key={i}>
                <h2 className="flex items-center gap-3 mb-5">
                  <span className="w-4 h-px bg-accent/50" />
                  <span className="text-base md:text-lg font-bold text-accent tracking-wide">
                    {section.heading}
                  </span>
                </h2>
                <div className="space-y-6 text-[15px] md:text-base text-muted leading-[2.15] md:leading-[2.25]">
                  {section.body.map((text, j) => (
                    <p key={j}>{text}</p>
                  ))}
                </div>

                {/* 中盤に一度だけ、店の想いをプルクオートで大きく見せる */}
                {i === PULLQUOTE_AFTER_INDEX && (
                  <figure className="mt-12 mb-0">
                    <div className="flex items-center gap-3 mb-5">
                      <span className="w-8 h-px bg-accent/40" />
                      <span className="w-1 h-1 rounded-full bg-accent/60" />
                    </div>
                    <blockquote className="text-xl md:text-2xl font-medium text-foreground/90 leading-[1.9] tracking-wide pl-1">
                      「{OWNER_PULLQUOTE}」
                    </blockquote>
                    <div className="flex items-center gap-3 mt-5">
                      <span className="w-1 h-1 rounded-full bg-accent/60" />
                      <span className="w-8 h-px bg-accent/40" />
                    </div>
                  </figure>
                )}
              </div>
            ))}
          </div>

          {/* 署名 */}
          <p className="mt-12 text-right text-sm text-foreground/80 tracking-wide">
            ― IZAKAYA きたげん 店主
          </p>
        </article>
      </section>

      {/* ── 導線（メニュー・店舗情報へ） ─────────────────── */}
      <section className="section-warm py-16 px-4 border-t border-border">
        <div className="max-w-lg mx-auto text-center">
          <p className="text-[9px] tracking-[0.6em] text-accent/70 font-medium mb-4">VISIT</p>
          <p className="text-sm text-muted leading-[2.1] mb-9">
            気の向いたときに、ふらっと。
            <br />
            きたげんで、お待ちしています。
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/menu"
              className="btn-lift w-full sm:w-auto inline-flex items-center justify-center
                         px-10 py-3.5 rounded-sm text-sm tracking-wider
                         bg-accent text-white hover:bg-accent-dark transition-colors duration-200"
            >
              メニューを見る
            </Link>
            <Link
              href="/info"
              className="btn-lift w-full sm:w-auto inline-flex items-center justify-center
                         px-8 py-3.5 rounded-sm text-sm tracking-wider
                         border border-accent/40 text-accent hover:bg-accent/5 transition-colors duration-200"
            >
              店舗情報・アクセス
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
