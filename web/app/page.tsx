import Link from "next/link";
import Image from "next/image";
import { Phone, MapPin, UtensilsCrossed, ExternalLink } from "lucide-react";
import { getSiteImages } from "./lib/site-images";
import { GALLERY_ITEMS } from "./lib/gallery";
import HeroImage from "./components/HeroImage";
import PhotoStrip from "./components/PhotoStrip";
import SectionInner from "./components/SectionInner";
import { PHONE, INSTAGRAM_URL, MAP_URL } from "./lib/contact";
import {
  BUSINESS_HOURS,
  LUNCH_SUSPENDED,
  REGULAR_CLOSED_SHORT,
  dinnerTimeLabel,
} from "./lib/businessHours";
import { STORY } from "./content/story";

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

// ヒーロー下に出す営業時間の一行。
// ランチ休止中（LUNCH_SUSPENDED）はディナーの時間だけを出す。
// ランチ営業中は、曜日ごとの開店時刻と閉店・L.O. を短くまとめて出す。
// 定休日（日曜定休）は、表示側でこの後ろに別の塊として添える。
function hoursSummary(): string {
  if (LUNCH_SUSPENDED) return dinnerTimeLabel();
  const opens = BUSINESS_HOURS.map((g) => `${g.days} ${g.open}〜`).join("／");
  const last = [...BUSINESS_HOURS].sort((a, b) => b.close.localeCompare(a.close))[0];
  return `${opens}（${last.close}まで・L.O. ${last.lo}）`;
}

// ヒーロー下の3つのボタン（電話・地図・メニュー）の共通の見た目。
// スマホでは3つ横並びでアイコンを上に、sm 以上ではアイコンと文字を横に並べる。高さは 48px 以上。
const QUICK_BTN =
  "btn-lift flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 " +
  "min-h-[52px] sm:min-h-[48px] px-2 sm:px-5 rounded-sm text-[13px] sm:text-sm tracking-wider " +
  "transition-colors duration-200 active:scale-[0.98]";

export default async function Home() {
  const SITE_IMAGES = await getSiteImages();

  return (
    <div className="min-h-screen">
      {/* ── ① Hero ──────────────────────────────────────────────
          ┌──────────────────────────────────────────────────────────┐
          │ 【写真の差し込み口】撮影後、下記2枚を同名で上書きするだけ  │
          │   ・PC横長  → web/public/images/hero/hero-pc.jpg           │
          │   ・SP縦長  → web/public/images/hero/hero-sp.jpg           │
          │ ※ 現状は仮画像。ファイル名は変えず同名で差し替えれば反映。 │
          │ ※ 構図の見え方（顔・料理の位置）は positionPc/positionSp   │
          │    の "center 40%" の数値で上下位置を微調整できます。      │
          └──────────────────────────────────────────────────────────┘ */}
      {/* 「幕」の動き：ヒーローは固定ヘッダー（h-16）のすぐ下（top-16）に止まり、
          下の内容（下の relative z-10 の囲み）がその上にかぶさって流れてくる。
          sticky が効くよう、祖先（このページの div・main・body）に overflow を付けないこと。 */}
      <section className="sticky top-16 z-0 h-[62vh] md:h-auto md:min-h-[82vh] flex items-center justify-center overflow-hidden bg-foreground">
        <HeroImage
          srcSp={SITE_IMAGES.hero.sp}
          srcPc={SITE_IMAGES.hero.pc}
          positionSp="center 42%"
          positionPc="center 40%"
        />

        {/* オーバーレイ：写真の温かみは残しつつ、白文字を確実に読ませる2層構成 */}
        {/* 1) 上下グラデーション（全体を軽く締め、下部をやや濃く） */}
        <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black/45 via-black/25 to-black/60" />
        {/* 2) 中央ヴィネット：見出し・キャッチの背後だけ重点的に暗くし、端は写真を見せる */}
        <div className="absolute inset-0 z-[1] bg-[radial-gradient(ellipse_62%_52%_at_50%_50%,rgba(0,0,0,0.4)_0%,transparent_72%)]" />

        <div className="hidden sm:block absolute top-20 left-8 w-8 h-8 border-t border-l border-white/25 z-10 hero-animate" />
        <div className="hidden sm:block absolute top-20 right-8 w-8 h-8 border-t border-r border-white/25 z-10 hero-animate" />
        <div className="hidden sm:block absolute bottom-12 left-8 w-8 h-8 border-b border-l border-white/25 z-10 hero-animate" />
        <div className="hidden sm:block absolute bottom-12 right-8 w-8 h-8 border-b border-r border-white/25 z-10 hero-animate" />

        <div className="relative z-10 text-center px-4">
          <p className="text-xs tracking-[0.5em] text-white/70 mb-4 hero-animate text-shadow">
            IZAKAYA
          </p>
          <h1 className="text-5xl sm:text-7xl md:text-9xl font-bold mb-4 hero-animate-delay text-white text-shadow">
            きたげん
          </h1>
          <div className="flex items-center justify-center gap-3 mb-4 hero-animate-delay">
            <div className="w-10 h-px bg-white/40" />
            <div className="w-1 h-1 rounded-full bg-accent" />
            <div className="w-10 h-px bg-white/40" />
          </div>
          <p className="text-[15px] sm:text-lg md:text-xl text-white/85 tracking-wide hero-animate-delay-2 text-shadow">
            ふらっと寄って、ちゃんとうまい。
          </p>
        </div>
      </section>

      {/* ── ヒーローにかぶさる内容（②〜⑨）──────────────────────
          背景色を付けて z-10 でヒーローより前に出す。上端にうっすら影。 */}
      <div className="relative z-10 bg-background shadow-[0_-10px_28px_rgba(47,36,28,0.16)]">

      {/* ── ② 営業時間とボタン（電話・地図・メニュー） ──────────
          営業時間は lib/businessHours.ts、電話・地図は lib/contact.ts から読む。 */}
      <section className="py-8 md:py-10 section-warm border-b border-border/60">
        <SectionInner maxW="max-w-3xl" className="text-center">
          <p className="text-sm md:text-base text-foreground mb-5 leading-relaxed">
            <span className="text-[10px] tracking-[0.4em] text-accent/80 mr-3 align-middle">
              営業時間
            </span>
            {/* ディナーだけの短い一行は折り返さない（ランチ営業中の長い文は折り返してよい）。
                「日曜定休」は別の塊にし、折り返すときは時間との間で折り返す。 */}
            <span className={`tabular-nums ${LUNCH_SUSPENDED ? "whitespace-nowrap" : ""}`}>
              {hoursSummary()}
            </span>{" "}
            <span className="inline-block whitespace-nowrap">{REGULAR_CLOSED_SHORT}</span>
          </p>
          <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
            <a
              href={`tel:${PHONE}`}
              className={`${QUICK_BTN} bg-accent text-white hover:bg-accent-dark font-bold`}
            >
              <Phone size={18} strokeWidth={2} aria-hidden="true" />
              電話する
            </a>
            <a
              href={MAP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={`${QUICK_BTN} border border-accent/40 text-accent bg-background/60 hover:bg-accent/5`}
            >
              <MapPin size={18} strokeWidth={1.75} aria-hidden="true" />
              地図を見る
            </a>
            <Link
              href="/menu"
              className={`${QUICK_BTN} border border-accent/40 text-accent bg-background/60 hover:bg-accent/5`}
            >
              <UtensilsCrossed size={18} strokeWidth={1.75} aria-hidden="true" />
              メニュー
            </Link>
          </div>
        </SectionInner>
      </section>

      {/* ── ③ OUR STORY ──────────────────────────────────────
          文章は content/story.ts。配列の1つが1行（ここで行を区切る）。
          ・スマホ：見出しだけ縦書きで中央に大きく、本文は横書き
          ・パソコン（md 以上）：見出しも本文も縦書き。右から左へ読み、見出しが右端 */}
      <section className="py-24 md:py-28 section-light">
        <SectionInner>
          <div>
            <p className="text-[10px] tracking-[0.5em] text-accent/80 mb-10 md:mb-14 text-center">
              OUR STORY
            </p>
            <div className="md:flex md:justify-center">
              <div className="md:[writing-mode:vertical-rl]">
                <div className="flex justify-center md:block [margin-block-end:3rem] md:[margin-block-end:3.5rem] lg:[margin-block-end:4.5rem]">
                  <h2 className="[writing-mode:vertical-rl] text-[2rem] md:text-3xl lg:text-4xl font-bold leading-[1.7] tracking-[0.18em]">
                    {STORY.heading.map((line) => (
                      <span key={line} className="block whitespace-nowrap">
                        {line}
                      </span>
                    ))}
                  </h2>
                </div>
                <div className="text-center md:text-start text-[15px] md:text-[14px] lg:text-base text-muted leading-[2.1] md:leading-[1.9] lg:leading-[2.1] tracking-wide md:tracking-[0.12em]">
                  {STORY.paragraphs.map((para, i) => (
                    <p
                      key={i}
                      className="[margin-block-end:1.6em] md:[margin-block-end:1.2em] last:[margin-block-end:0]"
                    >
                      {para.map((line) => (
                        <span key={line} className="block whitespace-nowrap">
                          {line}
                        </span>
                      ))}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </SectionInner>
      </section>

      {/* ── ④ こだわりの料理（画像左・テキスト右） ─────────── */}
      <section className="py-24 md:py-28 section-warm">
        <SectionInner>
          <div>
            {/* 写真=7 / テキスト=5：PCでは写真が左・大きく、テキストが右 */}
            <div className="grid grid-cols-1 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] gap-12 md:gap-20 items-center">
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
                <h2 className="text-3xl md:text-4xl font-bold leading-snug">
                  手作りにこだわった、
                  <br />
                  うまい一品。
                </h2>
                <SectionDivider />
                <p className="text-base md:text-lg text-muted leading-[2.1] md:leading-[2.2] mb-8">
                  きたげんの名物は、自家製のしゅうまいと鉄鍋餃子。
                  <br className="hidden sm:block" />
                  手間を惜しまず作る一品は、派手さはないけれど、
                  <br className="hidden sm:block" />
                  また食べたくなる味です。蒸したてのしゅうまい、
                  <br className="hidden sm:block" />
                  こんがり焼けた餃子を肴に、まずは一杯。
                  <br className="hidden sm:block" />
                  からあげ、豚の角煮、串の盛り合わせと、
                  <br className="hidden sm:block" />
                  箸もお酒も進む料理を取り揃えています。
                  <br className="hidden sm:block" />
                  飾らないけれど、&ldquo;ちゃんとうまい&rdquo;。
                  <br className="hidden sm:block" />
                  それがきたげんの一品です。
                </p>
                <Link
                  href="/menu"
                  className="btn-lift inline-flex items-center gap-2 text-sm text-accent border border-accent/40 px-5 py-2.5 rounded-sm hover:bg-accent/5 transition-colors"
                >
                  メニューを見る →
                </Link>
              </div>
            </div>
          </div>
        </SectionInner>
      </section>


      {/* ── ⑤ 料理ギャラリー ──────────────────────────────────
          写真は public/images/gallery/ に置き、app/lib/gallery.ts の
          GALLERY_ITEMS に追記すると表示される（フォルダ方式）。
          写真が1枚も無い（配列が空）間は、セクションごと非表示にする。 */}
      {GALLERY_ITEMS.length > 0 && (
        <section className="py-24 md:py-28 section-deep">
          <SectionInner>
            <div>
              <div className="text-center mb-10">
                <p className="text-[10px] tracking-[0.45em] text-accent/80 mb-2">
                  GALLERY
                </p>
                <h2 className="text-3xl md:text-4xl font-bold">きたげんの料理</h2>
                <div className="flex items-center justify-center gap-3 mt-4">
                  <div className="w-8 h-px bg-accent/50" />
                  <div className="w-1 h-1 rounded-full bg-accent/70" />
                  <div className="w-8 h-px bg-accent/50" />
                </div>
                <p className="text-base text-muted mt-4">
                  定番から季節のひと品まで。
                </p>
              </div>
            </div>
            <div>
              <PhotoStrip items={GALLERY_ITEMS} />
            </div>
          </SectionInner>
        </section>
      )}

      {/* ── ⑥ Instagram ──────────────────────────────────────
          最新情報・急な営業の変更は Instagram で発信している。URL は lib/contact.ts。
          お知らせの一覧は /news のページに残している。 */}
      <section className="py-24 md:py-28 section-light">
        <SectionInner maxW="max-w-4xl" className="text-center">
          <div>
            <p className="text-[10px] tracking-[0.5em] text-accent/70 mb-2">
              INSTAGRAM
            </p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-wide">最新情報</h2>
            <div className="flex items-center justify-center gap-3 mt-4">
              <div className="w-8 h-px bg-accent/50" />
              <div className="w-1 h-1 rounded-full bg-accent/70" />
              <div className="w-8 h-px bg-accent/50" />
            </div>
            <p className="text-base md:text-lg text-muted leading-[2.1] mt-6 mb-9">
              日々の料理や、急な営業の変更は
              <br />
              Instagram でお知らせしています。
            </p>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-lift inline-flex items-center justify-center gap-2 min-h-[48px] px-8 rounded-sm text-sm tracking-wider border border-accent/40 text-accent hover:bg-accent/5 transition-colors duration-200"
            >
              Instagram を見る
              <ExternalLink size={14} strokeWidth={1.75} aria-hidden="true" />
            </a>
          </div>
        </SectionInner>
      </section>

      {/* ── ⑦ くつろぎの空間（テキスト左・画像右） ─────────── */}
      <section className="py-24 md:py-28 section-warm">
        <SectionInner>
          <div>
            {/* 写真=7 / テキスト=5：写真を大きく、テキストは読みやすい幅に保つ */}
            <div className="grid grid-cols-1 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-12 md:gap-20 items-center">
              {/* テキスト */}
              <div>
                <p className="text-[10px] tracking-[0.5em] text-accent/80 mb-3">
                  SPACE
                </p>
                <h2 className="text-3xl md:text-4xl font-bold leading-snug">
                  肩肘張らない、
                  <br />
                  居心地の良い空間。
                </h2>
                <SectionDivider />
                <p className="text-base md:text-lg text-muted leading-[2.1] md:leading-[2.2] mb-8">
                  気の向くままに使える、そんな居心地を大事にしています。
                  <br className="hidden sm:block" />
                  カウンターは、お一人でも仕事帰りでも、
                  <br className="hidden sm:block" />
                  ふらっと立ち寄って一杯やるのにちょうどいい席。
                  <br className="hidden sm:block" />
                  2階には座敷があり、気の合う仲間との飲み会や、
                  <br className="hidden sm:block" />
                  ご家族での食事にぴったりです。
                  <br className="hidden sm:block" />
                  ひとりでも、大勢でも、それぞれの居心地がある一軒。
                  <br className="hidden sm:block" />
                  <Link
                    href="/#group-reservation"
                    className="text-accent hover:text-accent-dark underline underline-offset-4 decoration-accent/40 transition-colors duration-200"
                  >
                    ご宴会や団体でのご利用は、貸切でのご相談も承っています。
                  </Link>
                  <br className="hidden sm:block" />
                  その日の気分や人数に合わせて、
                  <br className="hidden sm:block" />
                  思い思いにお過ごしください。
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
          </div>
        </SectionInner>
      </section>


      {/* ── ⑧ 団体・宴会のご予約 ──────────────────────────────
          SPACE の文中リンク（/#group-reservation）の飛び先。 */}
      <section id="group-reservation" className="py-20 md:py-24 section-light scroll-mt-24">
        <SectionInner className="text-center">
          <div>
            <div className="rounded-xl border border-border bg-background/70 p-7 sm:p-8 max-w-xl mx-auto">
              <p className="text-[9px] tracking-[0.55em] text-accent/70 font-medium mb-3">
                PARTY &amp; GROUP
              </p>
              <p className="text-lg font-bold text-foreground mb-1.5">
                ご宴会・団体でのご利用は
              </p>
              <p className="text-sm text-muted mb-7 leading-relaxed">
                お席をご用意しますので、お電話ください。
              </p>

              {/* 電話予約ボタン（番号込み・Header/MobileNav と同じ tel: パターン） */}
              <a
                href={`tel:${PHONE}`}
                className="btn-lift inline-flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1
                           w-full py-4 px-4 rounded-sm
                           bg-accent text-white hover:bg-accent-dark
                           font-bold text-sm tracking-wider
                           transition-colors duration-200 active:scale-[0.98]"
              >
                <span className="inline-flex items-center gap-2">
                  <Phone size={16} strokeWidth={2} />
                  団体・宴会のご予約
                </span>
                <span className="tabular-nums">{PHONE}</span>
              </a>

              <p className="text-sm text-muted/90 mt-5 leading-relaxed">
                ご予約時に「ホームページを見た」とお伝えください。
                <br />
                営業時間外（昼間・開店前）でも承ります。
              </p>
            </div>
          </div>
        </SectionInner>
      </section>

      {/* ── ⑨ 店主紹介へのリンク ──────────────────────────────── */}
      <section className="py-14 md:py-16 section-warm">
        <SectionInner className="text-center">
          <div>
            <p className="text-[10px] tracking-[0.5em] text-accent/80 mb-3">
              OWNER
            </p>
            <p className="text-base text-muted mb-5">
              きたげんの店主について。
            </p>
            <Link
              href="/owner"
              className="btn-lift inline-flex items-center justify-center gap-2 min-h-[44px] text-sm text-accent border border-accent/40 px-6 rounded-sm hover:bg-accent/5 transition-colors"
            >
              店主紹介を見る →
            </Link>
          </div>
        </SectionInner>
      </section>
      </div>
    </div>
  );
}
