import Link from "next/link";
import Image from "next/image";
import { getMenusForTop } from "./lib/menus";
import { getAnnouncements } from "./lib/announcements";
import { getSiteImages } from "./lib/site-images";
import ParallaxHero from "./components/ParallaxHero";
import ScrollReveal from "./components/ScrollReveal";
import PhotoStrip from "./components/PhotoStrip";
import NewsCard from "./components/NewsCard";

// 左右分割セクションの画像コンポーネント
// public/ に画像を配置すれば自動で表示されます
function SplitImage({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-card-bg border border-border/40">
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover brightness-[0.93] contrast-[1.02]"
        sizes="(max-width: 768px) 100vw, 50vw"
      />
    </div>
  );
}

// セクション見出しの装飾ライン
function SectionDivider() {
  return (
    <div className="flex items-center gap-3 my-5">
      <div className="w-8 h-px bg-accent/50" />
      <div className="w-1 h-1 rounded-full bg-accent/70" />
    </div>
  );
}

export default async function Home() {
  const [topItems, announcements, SITE_IMAGES] = await Promise.all([
    getMenusForTop(),
    getAnnouncements(),
    getSiteImages(),
  ]);
  const photoItems = topItems.map((i) => ({ ...i, image: i.image ?? "" }));
  const recentNews = announcements.slice(0, 5);

  return (
    <div className="min-h-screen">
      {/* ── ① Hero ──────────────────────────────────────────── */}
      <section className="relative h-[55vh] md:h-auto md:min-h-[82vh] flex items-center justify-center overflow-hidden bg-foreground">
        <ParallaxHero
          srcSp={SITE_IMAGES.hero.sp}
          srcPc={SITE_IMAGES.hero.pc}
          positionSp="center 40%"
          positionPc="center 40%"
        />
        <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black/50 via-black/30 to-black/60" />

        <div className="hidden sm:block absolute top-20 left-8 w-8 h-8 border-t border-l border-white/25 z-10 hero-animate" />
        <div className="hidden sm:block absolute top-20 right-8 w-8 h-8 border-t border-r border-white/25 z-10 hero-animate" />
        <div className="hidden sm:block absolute bottom-12 left-8 w-8 h-8 border-b border-l border-white/25 z-10 hero-animate" />
        <div className="hidden sm:block absolute bottom-12 right-8 w-8 h-8 border-b border-r border-white/25 z-10 hero-animate" />

        <div className="relative z-10 text-center px-4">
          <p className="text-xs tracking-[0.5em] text-white/60 mb-4 hero-animate">
            IZAKAYA
          </p>
          <h1 className="text-5xl sm:text-7xl md:text-9xl font-bold mb-4 hero-animate-delay text-white text-shadow">
            きたげん
          </h1>
          <div className="flex items-center justify-center gap-3 mb-4 hero-animate-delay">
            <div className="w-10 h-px bg-white/35" />
            <div className="w-1 h-1 rounded-full bg-accent" />
            <div className="w-10 h-px bg-white/35" />
          </div>
          <p className="text-sm sm:text-lg md:text-xl text-white/65 tracking-wide hero-animate-delay-2 text-shadow">
            落ち着いて飲める、ちゃんとした居酒屋。
          </p>
        </div>
      </section>

      {/* ── ② きたげんについて（テキスト左・画像右） ──────── */}
      <section className="py-24 px-4 section-light">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
              {/* テキスト */}
              <div>
                <p className="text-[10px] tracking-[0.5em] text-accent/80 mb-3">
                  ABOUT
                </p>
                <h2 className="text-2xl md:text-3xl font-bold leading-snug">
                  ふらっと寄れる、
                  <br />
                  ちゃんとした居酒屋。
                </h2>
                <SectionDivider />
                <p className="text-sm md:text-base text-muted leading-[2.1] md:leading-[2.2] mb-8">
                  大阪・桃谷にある「きたげん」は、気軽に入れて、
                  <br />
                  料理もお酒もちゃんとおいしい居酒屋です。
                  <br />
                  一人でふらっと立ち寄っても、仲間とにぎやかに過ごしても、
                  <br />
                  自然と落ち着ける場所でありたいと思っています。
                </p>
                <Link
                  href="/info"
                  className="btn-lift inline-flex items-center gap-2 text-sm text-accent border border-accent/40 px-5 py-2.5 rounded-sm hover:bg-accent/5 transition-colors"
                >
                  店舗情報を見る →
                </Link>
              </div>

              {/* 画像（public/shop.jpg を配置してください） */}
              <SplitImage src={SITE_IMAGES.about.shop} alt="きたげん店内" />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── ③ こだわりの料理（画像左・テキスト右） ─────────── */}
      <section className="py-24 px-4 section-warm">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
              {/* 画像（スマホでは下に、PCでは左に） */}
              {/* public/food-main.jpg を配置してください */}
              <div className="order-2 md:order-1">
                <SplitImage src={SITE_IMAGES.food.main} alt="きたげんの料理" />
              </div>

              {/* テキスト（スマホでは上に、PCでは右に） */}
              <div className="order-1 md:order-2">
                <p className="text-[10px] tracking-[0.5em] text-accent/80 mb-3">
                  FOOD
                </p>
                <h2 className="text-2xl md:text-3xl font-bold leading-snug">
                  手作りにこだわった、
                  <br />
                  うまい一品。
                </h2>
                <SectionDivider />
                <p className="text-sm md:text-base text-muted leading-[2.1] md:leading-[2.2] mb-8">
                  ふらっと来ても、ちゃんと満足できる。
                  <br />
                  そんな一品をご用意しています。
                  <br className="hidden sm:block" />
                  餃子やしゅうまい、唐揚げなど、
                  <br />
                  お酒が進む味に仕上げています。
                </p>
                <Link
                  href="/menu"
                  className="btn-lift inline-flex items-center gap-2 text-sm text-accent border border-accent/40 px-5 py-2.5 rounded-sm hover:bg-accent/5 transition-colors"
                >
                  メニューを見る →
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── ④ くつろぎの空間（テキスト左・画像右） ─────────── */}
      <section className="py-24 px-4 section-light">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
              {/* テキスト */}
              <div>
                <p className="text-[10px] tracking-[0.5em] text-accent/80 mb-3">
                  SPACE
                </p>
                <h2 className="text-2xl md:text-3xl font-bold leading-snug">
                  肩肘張らない、
                  <br />
                  居心地の良い空間。
                </h2>
                <SectionDivider />
                <p className="text-sm md:text-base text-muted leading-[2.1] md:leading-[2.2] mb-8">
                  気を張らずに過ごせる、
                  <br className="sm:hidden" />
                  ちょうどいい距離感の空間。
                  <br />
                  お一人様でもグループでも、気兼ねなくお過ごしください。
                  <br />
                  宴会や飲み会のご予約もお気軽にどうぞ。
                </p>
                <Link
                  href="/info"
                  className="btn-lift inline-flex items-center gap-2 text-sm text-accent border border-accent/40 px-5 py-2.5 rounded-sm hover:bg-accent/5 transition-colors"
                >
                  店舗情報を見る →
                </Link>
              </div>

              {/* 画像（public/counter.jpg を配置してください） */}
              <SplitImage
                src={SITE_IMAGES.space.counter}
                alt="きたげんのカウンター席"
              />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── ⑤ 料理ギャラリー ────────────────────────────────── */}
      <section className="py-20 px-4 section-deep">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-10">
              <p className="text-[10px] tracking-[0.45em] text-accent/80 mb-2">
                GALLERY
              </p>
              <h2 className="text-2xl font-bold">きたげんの料理</h2>
              <div className="flex items-center justify-center gap-3 mt-4">
                <div className="w-8 h-px bg-accent/50" />
                <div className="w-1 h-1 rounded-full bg-accent/70" />
                <div className="w-8 h-px bg-accent/50" />
              </div>
              <p className="text-sm text-muted mt-4">
                定番から季節のひと品まで。
              </p>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={80}>
            <PhotoStrip items={photoItems} />
          </ScrollReveal>
        </div>
      </section>

      {/* ── ⑥ お知らせ ──────────────────────────────────────── */}
      {recentNews.length > 0 && (
        <section className="py-20 px-4 section-light">
          <div className="max-w-2xl mx-auto">
            <ScrollReveal>
              <div className="text-center mb-12">
                <p className="text-[10px] tracking-[0.5em] text-accent/70 mb-2">
                  NEWS
                </p>
                <h2 className="text-2xl font-bold tracking-wide">お知らせ</h2>
                <div className="flex items-center justify-center gap-3 mt-4">
                  <div className="w-8 h-px bg-accent/50" />
                  <div className="w-1 h-1 rounded-full bg-accent/70" />
                  <div className="w-8 h-px bg-accent/50" />
                </div>
                <p className="text-xs text-muted mt-4 tracking-wider">
                  きたげんからのご案内
                </p>
              </div>
            </ScrollReveal>
            <div className="space-y-4">
              {recentNews.map((item, i) => (
                <ScrollReveal key={item.id} delay={i * 80}>
                  <NewsCard item={item} />
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── ⑦ はじめてのお客様へ ────────────────────────────── */}
      <section className="py-28 px-4 section-warm">
        <div className="max-w-lg mx-auto text-center">
          <ScrollReveal>
            {/* ラベル */}
            <p className="text-[9px] tracking-[0.65em] text-accent/70 font-medium mb-5">
              VISIT
            </p>

            {/* 見出し */}
            <h2 className="text-2xl md:text-3xl font-bold leading-snug mb-6">
              はじめてのお客様へ
            </h2>

            {/* 装飾ライン */}
            <div className="flex items-center justify-center gap-3 mb-9">
              <div className="w-12 h-px bg-accent/30" />
              <div className="w-1.5 h-1.5 rounded-full bg-accent/50" />
              <div className="w-12 h-px bg-accent/30" />
            </div>

            {/* 本文 — 簡潔に3行以内 */}
            <p className="text-sm text-muted leading-[2.1] mb-12">
              予約不要、お一人でもどうぞ。
              <br />
              きたげんは、気軽に入れてちゃんとおいしい、
              <br />
              桃谷の居酒屋です。
            </p>

            {/* CTA ボタン — 主従明確 */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              {/* Primary：メイン導線 */}
              <Link
                href="/menu"
                className="btn-lift w-full sm:w-auto inline-flex items-center justify-center
                           px-10 py-3.5 rounded-sm text-sm tracking-wider
                           bg-accent text-white hover:bg-accent-dark
                           transition-colors duration-200"
              >
                メニューを見る
              </Link>

              {/* Secondary：サブ導線 */}
              <Link
                href="/info"
                className="btn-lift w-full sm:w-auto inline-flex items-center justify-center
                           px-8 py-3.5 rounded-sm text-sm tracking-wider
                           border border-accent/40 text-accent hover:bg-accent/5
                           transition-colors duration-200"
              >
                店舗情報・アクセス
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
