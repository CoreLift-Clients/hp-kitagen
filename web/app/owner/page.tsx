import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { OWNER_PHOTO, OWNER_PHOTO_ALT } from "../lib/owner";

export const metadata: Metadata = {
  title: "店主紹介 | IZAKAYA きたげん",
  description:
    "桃谷で生まれ育った、居酒屋きたげんの店主より。みんなの居場所になる店を目指して。鉄鍋餃子や自家製しゅうまいへの想い、女性お一人でも入りやすい店づくりについてお話しします。",
};

// 本文（一人称・確定稿）。段落ごとに配列で持ち、読み物としての余白・行間を整える。
const PARAGRAPHS = [
  "『きたげん』という店名は、実は私の小学生の頃からのあだ名なんです。この桃谷で生まれ育って、気づけばこの街でお店を開いていました。",
  "店を始めたとき、一番やりたかったのは、みんなが自然と集まってくる場所をつくること。特別な日じゃなくても、ふらっと立ち寄って、うまいものを食べて、気持ちよく帰ってもらえる。そんな、地元のみんなの居場所みたいな店にしたかったんです。",
  "料理は、美味しくて手頃に、を大事にしています。一番の自慢は鉄鍋餃子。ひとつひとつ手をかけた自家製しゅうまいや、揚げたてのからあげも、ぜひ味わってほしい一品です。お酒が進む料理を、気取らずに楽しんでもらえたらうれしいです。",
  "そして、女性のお一人でも、気兼ねなく入ってもらえる店にしたいと思っています。居酒屋は一人だと入りにくいこともあると思いますが、きたげんはそんな心配のいらない店を目指しています。",
  "桃谷にお越しの際は、ぜひ気軽にのぞいてみてください。お待ちしています。",
];

export default function OwnerPage() {
  const hasPhoto = OWNER_PHOTO.trim() !== "";

  return (
    <div className="min-h-screen pt-16">

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
              <figcaption className="mt-4 text-xs text-muted/70 tracking-wide">
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

          {/* 本文段落 */}
          <div className="space-y-7 text-[15px] md:text-base text-muted leading-[2.15] md:leading-[2.25]">
            {PARAGRAPHS.map((text, i) => (
              <p key={i}>{text}</p>
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
