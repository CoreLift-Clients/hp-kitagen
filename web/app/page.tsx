import { Fragment, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { Phone, ExternalLink } from "lucide-react";
import { getSiteImages } from "./lib/site-images";
import { GALLERY_ITEMS } from "./lib/gallery";
import HeroImage from "./components/HeroImage";
import PhotoStrip from "./components/PhotoStrip";
import SectionInner from "./components/SectionInner";
import { PHONE, INSTAGRAM_URL } from "./lib/contact";
import { STORY } from "./content/story";
import { getSpecialties, type DisplaySpecialty } from "./content";
import { formatTaxIncludedPrice } from "./content/specialties";

// 明朝体（Noto Serif JP）。このページでだけ読み込む。
// 太さは使うものだけ：OUR STORY の本文 500、ほかの欄の本文 600、見出し 700。字の並び（読み込めないときの代わりの明朝体）は
// globals.css の --font-noto-serif-jp。Tailwind の font-serif で当てる。
import "@fontsource/noto-serif-jp/500.css";
import "@fontsource/noto-serif-jp/600.css";
import "@fontsource/noto-serif-jp/700.css";

// 左右分割セクションの画像コンポーネント
// public/ に画像を配置すれば自動で表示されます
// スマホ（sm より狭い画面）では画面の幅いっぱいに出すので、角の丸みと枠を付けない
// （左右の余白を消すのは呼び出し側の -mx-6 sm:mx-0）。
function SplitImage({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative aspect-[4/3] overflow-hidden bg-card-bg sm:rounded-lg sm:border sm:border-border/40">
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

// ─── 明朝体の文章（OUR STORY 以外の欄） ───
// ・パソコン（sm 以上）… 配列の1つが1行。今までの <br className="hidden sm:block" /> と同じ位置で改行する
// ・スマホ（sm より狭い）… 行の区切りは使わず、「。」で終わるところごとに段落を分け、
//   段落の間を 1.75 字分あける。段落の中は自然に折り返す（word-break: auto-phrase は呼び出し側の p）
// ・リンクなど文字列でない行は { node } で渡す。その行は「。」で終わる1文として扱う
type ProseLine = string | { node: ReactNode };

// スマホでだけ出す、段落の間のあき
function MobileParaBreak() {
  return <span aria-hidden="true" className="block h-[1.75em] sm:hidden" />;
}

function proseLines(lines: readonly ProseLine[]): ReactNode[] {
  const out: ReactNode[] = [];
  lines.forEach((line, i) => {
    const isLastLine = i === lines.length - 1;
    if (typeof line === "string") {
      const parts = line.split(/(?<=。)/);
      parts.forEach((part, j) => {
        out.push(<Fragment key={`${i}-${j}`}>{part}</Fragment>);
        const isEnd = isLastLine && j === parts.length - 1;
        if (part.endsWith("。") && !isEnd) {
          out.push(<MobileParaBreak key={`${i}-${j}-p`} />);
        }
      });
    } else {
      out.push(<Fragment key={i}>{line.node}</Fragment>);
      if (!isLastLine) out.push(<MobileParaBreak key={`${i}-p`} />);
    }
    if (!isLastLine) out.push(<br key={`${i}-br`} className="hidden sm:block" />);
  });
  return out;
}

// 見出し・本文の字（OUR STORY 以外の欄）。word-break: auto-phrase が効かないブラウザでは普通の折り返しになる
// ・見出し … すべての画面の幅で明朝体 700
// ・本文 … lg より狭い画面（スマホ・タブレット）はゴシック体 400、lg 以上は明朝体 600。
//   lg より狭い画面では明朝体の本文用の太さ（500・600）のファイルを読まない
const SERIF_HEADING = "font-serif font-bold [word-break:auto-phrase]";
const BODY_FONT = "font-sans font-normal lg:font-serif lg:font-semibold [word-break:auto-phrase]";

// ほかの欄の本文の大きさと色（OUR STORY 以外）。色は OUR STORY と同じ foreground。
// ・BODY_TEXT … スマホ 17px、md 以上 19px（INSTAGRAM・GALLERY・OWNER）
// ・BODY_TEXT_SPLIT … スマホ 17px、md 以上 18px（写真と左右に並ぶ FOOD・SPACE）。
//   文章の列は最大で約 420px。19px だと 23 字の行（「手間を惜しまず作る一品は、派手さはないけれど、」など）が
//   入りきらず、パソコンの改行の位置が崩れるため 18px のままにしている
const BODY_TEXT = "text-[17px] md:text-[19px] text-foreground";
const BODY_TEXT_SPLIT = "text-[17px] md:text-[18px] text-foreground";

// 写真のない欄（INSTAGRAM・PARTY & GROUP・OWNER）と、写真だけの欄（GALLERY）の見出しまわりの揃え方
// ・lg（1024px）以上 … 英字の小見出し・見出し・飾り・本文・ボタンを横の真ん中にそろえる
// ・lg より狭い画面（スマホ・タブレット）… 今までどおり左揃え
// ・飾り（線・点・線）は CENTER_PC_DIVIDER を flex の囲みに付けて真ん中に置く
// 写真と文章が左右に並ぶ欄（FOOD・SPACE）には使わない
const CENTER_PC = "lg:text-center";
const CENTER_PC_DIVIDER = "lg:justify-center";

// ─── FOOD の下の名物の一覧 ───
// データは content/specialties.ts（写真と値段がそろった品だけが渡ってくる）。0 品のときは呼び出し側で出さない。
// ・並べ方 … スマホ 2 列、md 3 列、lg 以上 4 列。写真は正方形に切り取る
// ・字 … 品名は明朝体 700（SERIF_HEADING）、値段・ひとことは本文と同じ（パソコン明朝体・スマホゴシック体）
// ・写真の角と枠は SplitImage（sm 以上）と同じ
function SpecialtyList({ items }: { items: readonly DisplaySpecialty[] }) {
  return (
    <div className="mt-16 md:mt-20">
      <h3 className={`text-xl md:text-2xl ${SERIF_HEADING}`}>きたげんの名物</h3>
      <ul className="mt-6 md:mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-10">
        {items.map((item) => (
          <li key={item.id}>
            <div className="relative aspect-square overflow-hidden rounded-md bg-card-bg border border-border/40">
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover brightness-[0.93] contrast-[1.02]"
                sizes="(max-width: 767px) 50vw, (max-width: 1023px) 33vw, 280px"
              />
            </div>
            <p className={`mt-3 text-[16px] md:text-[17px] leading-snug text-foreground ${SERIF_HEADING}`}>
              {item.name}
            </p>
            <p className={`mt-1 text-[15px] text-accent tabular-nums ${BODY_FONT}`}>
              {formatTaxIncludedPrice(item.price)}
            </p>
            {item.note && (
              <p className={`mt-1.5 text-[14px] md:text-[15px] leading-relaxed text-muted ${BODY_FONT}`}>
                {item.note}
              </p>
            )}
          </li>
        ))}
      </ul>
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
  const SITE_IMAGES = await getSiteImages();
  const specialties = await getSpecialties();

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
          sticky が効くよう、祖先（このページの div・main・body）に overflow を付けないこと。
          高さは hero-full（globals.css）：ヘッダーの下から画面のいちばん下まで（100svh − 4rem）。
          スマホ用の写真は横長で左右が大きく切れるため、入り口と看板が真ん中に来る位置（横 51%）にしている。 */}
      <section className="hero-full sticky top-16 z-0 flex items-center justify-center overflow-hidden bg-foreground">
        <HeroImage
          srcSp={SITE_IMAGES.hero.sp}
          srcPc={SITE_IMAGES.hero.pc}
          positionSp="51% 50%"
          positionPc="center 40%"
        />

        {/* オーバーレイ：写真の温かみは残しつつ、白文字を確実に読ませる2層構成 */}
        {/* 1) 上下グラデーション（全体を軽く締め、下部をやや濃く） */}
        <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black/45 via-black/25 to-black/60" />
        {/* 2) 中央ヴィネット：見出し・キャッチの背後だけ重点的に暗くし、端は写真を見せる */}
        <div className="absolute inset-0 z-[1] bg-[radial-gradient(ellipse_62%_52%_at_50%_50%,rgba(0,0,0,0.4)_0%,transparent_72%)]" />

        <div className="hidden sm:block absolute top-20 left-8 w-8 h-8 border-t border-l border-white/25 z-10 hero-animate" />
        <div className="hidden sm:block absolute top-20 right-8 w-8 h-8 border-t border-r border-white/25 z-10 hero-animate" />
        {/* 下の2つの飾りは、md より狭い画面では下に固定した「電話する」ボタン（52px ＋ safe-area）の分だけ上げる */}
        <div className="hidden sm:block absolute bottom-12 max-md:bottom-[calc(3rem+52px+env(safe-area-inset-bottom))] left-8 w-8 h-8 border-b border-l border-white/25 z-10 hero-animate" />
        <div className="hidden sm:block absolute bottom-12 max-md:bottom-[calc(3rem+52px+env(safe-area-inset-bottom))] right-8 w-8 h-8 border-b border-r border-white/25 z-10 hero-animate" />

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

        {/* 下に続きがある目印（飾り。動かさない・読み上げない）。
            高さを svh で決めているので、スマホのブラウザの下のバーが出ていても隠れない。
            画面の高さが低いとき（横向きのスマホなど）は店名と重なるので出さない。
            md より狭い画面では、下に固定した「電話する」ボタン（52px ＋ safe-area）と重ならないよう、その分だけ上げる。 */}
        <div
          aria-hidden="true"
          className="absolute left-1/2 -translate-x-1/2 bottom-[calc(1.25rem+env(safe-area-inset-bottom))] max-md:bottom-[calc(1.25rem+52px+env(safe-area-inset-bottom))] z-10 flex flex-col items-center gap-2 [@media(max-height:480px)]:hidden"
        >
          <span className="text-[10px] tracking-[0.4em] pl-[0.4em] text-white/70 text-shadow">SCROLL</span>
          <span className="block w-px h-10 bg-white/40" />
        </div>
      </section>

      {/* ── ヒーローにかぶさる内容（③〜⑨）──────────────────────
          z-10 でヒーローより前に出す。上端にうっすら影。
          背景は各欄の section-* が持つ（この囲みに背景を付けると OUR STORY が透けなくなる）。
          OUR STORY だけ story-glass で少し透かし、後ろのヒーロー写真をすりガラス越しに見せる。
          透け具合・ぼかしの強さは globals.css の .story-glass の変数で変える。
          ※ 欄を足すときは、必ず section-* などの不透明な背景を付けること。 */}
      <div className="relative z-10 shadow-[0_-10px_28px_rgba(47,36,28,0.16)]">

      {/* ── ③ OUR STORY ──────────────────────────────────────
          文章は content/story.ts。見出しは配列の1つが1行。本文は lg 以上でだけ配列の1つが1行。
          ・スマホ・md：見出しだけ縦書きで中央に大きく、本文は横書き。
            本文は段落ごとに行をつなげて1つの文章にし、自然に折り返す（auto-phrase・text-wrap: pretty）
          ・lg（1024px）以上：見出しも本文も縦書き。右から左へ読み、見出しが右端
          ・見出しは明朝体 700（すべての画面の幅）。
            本文は lg より狭い画面ではゴシック体 400、lg 以上は明朝体 500（ほかの欄の本文 600 より一段細くし、主張を抑える）
          ・lg より狭い画面の本文：左右の余白（24px）いっぱいの幅で左揃え。
            md では1行が長くなりすぎないよう、幅の上限を 33em（1行 約32字）にして横の真ん中に置く
          ・本文の大きさ：lg より狭い画面 18px、lg 16px、xl 19px。
            行の間隔は lg より狭い画面 2.0、lg 以上 1.95。段落の間は 2〜2.25 字分。
            lg の縦書きは 1024px の画面で横幅が約 924px（使える幅は約 943px）。
            xl の縦書きは横幅が約 1081px（使える幅は 1088px）。どちらも余裕が少ない。
            文章を足して行や段落が増えたら、ここの計算を見直すこと */}
      <section className="section-screen py-24 md:py-16 section-light story-glass">
        <SectionInner>
          <div>
            <p className="text-[10px] tracking-[0.5em] text-accent/80 text-center">
              OUR STORY
            </p>
            <div className="flex items-center justify-center gap-3 mt-4 mb-10 md:mb-14">
              <div className="w-8 h-px bg-accent/50" />
              <div className="w-1 h-1 rounded-full bg-accent/70" />
              <div className="w-8 h-px bg-accent/50" />
            </div>
            <div className="font-serif lg:flex lg:justify-center">
              <div className="lg:[writing-mode:vertical-rl]">
                <div className="flex justify-center lg:block [margin-block-end:3.5rem] md:[margin-block-end:4rem] lg:[margin-block-end:5rem] xl:[margin-block-end:5.5rem]">
                  <h2 className="[writing-mode:vertical-rl] text-[2.25rem] md:text-[2.5rem] lg:text-4xl xl:text-[2.5rem] font-bold leading-[1.7] tracking-[0.18em]">
                    {STORY.heading.map((line) => (
                      <span key={line} className="block whitespace-nowrap">
                        {line}
                      </span>
                    ))}
                  </h2>
                </div>
                <div className="mx-auto max-w-[33em] lg:mx-0 lg:max-w-none text-start text-[18px] lg:text-[16px] xl:text-[19px] font-sans font-normal lg:font-serif lg:font-medium text-foreground leading-[2] lg:leading-[1.95] tracking-wide lg:tracking-[0.12em] max-lg:[word-break:auto-phrase] max-lg:text-pretty">
                  {STORY.paragraphs.map((para, i) => (
                    <p
                      key={i}
                      className="[margin-block-end:2.25em] lg:[margin-block-end:2em] last:[margin-block-end:0]"
                    >
                      {/* lg より狭い画面は行をつなげる（span は inline、間に空白は入れない）。
                          lg 以上は1行ずつ（block・折り返さない） */}
                      {para.map((line) => (
                        <span key={line} className="lg:block lg:whitespace-nowrap">
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

      {/* ── ④ こだわりの料理（画像左・テキスト右） ─────────────
          md 未満：写真 → FOOD → 見出し → 文章 → ボタン。スマホの写真は幅いっぱい */}
      <section className="section-screen py-24 md:py-16 section-warm">
        <SectionInner>
          <div>
            {/* 写真=7 / テキスト=5：PCでは写真が左・大きく、テキストが右 */}
            <div className="grid grid-cols-1 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] gap-12 md:gap-20 items-center">
              {/* 画像（スマホでは上に、PCでは左に） */}
              {/* public/food-main.jpg を配置してください */}
              <div className="-mx-6 sm:mx-0">
                <SplitImage src={SITE_IMAGES.food.main} alt="きたげんの料理" />
              </div>

              {/* テキスト（スマホでは下に、PCでは右に） */}
              <div>
                <p className="text-[10px] tracking-[0.5em] text-accent/80 mb-3">
                  FOOD
                </p>
                <h2 className={`text-3xl md:text-4xl leading-snug ${SERIF_HEADING}`}>
                  手作りにこだわった、
                  <br />
                  うまい一品。
                </h2>
                <SectionDivider />
                <p className={`${BODY_TEXT_SPLIT} leading-[2.1] md:leading-[2.2] mb-8 ${BODY_FONT}`}>
                  {proseLines([
                    "きたげんの名物は、自家製のしゅうまいと鉄鍋餃子。",
                    "手間を惜しまず作る一品は、派手さはないけれど、",
                    "また食べたくなる味です。蒸したてのしゅうまい、",
                    "こんがり焼けた餃子を肴に、まずは一杯。",
                    "からあげ、豚の角煮、串の盛り合わせと、",
                    "箸もお酒も進む料理を取り揃えています。",
                    "飾らないけれど、“ちゃんとうまい”。",
                    "それがきたげんの一品です。",
                  ])}
                </p>
                <Link
                  href="/menu"
                  className="btn-lift inline-flex items-center gap-2 text-sm text-accent border border-accent/40 px-5 py-2.5 rounded-sm hover:bg-accent/5 transition-colors"
                >
                  メニューを見る →
                </Link>
              </div>
            </div>

            {/* 名物の一覧。表示できる品が 0 のあいだは出さない（今までと同じ見た目） */}
            {specialties.length > 0 && <SpecialtyList items={specialties} />}
          </div>
        </SectionInner>
      </section>


      {/* ── ⑤ 料理ギャラリー ──────────────────────────────────
          写真は public/images/gallery/ に置き、app/lib/gallery.ts の
          GALLERY_ITEMS に追記すると表示される（フォルダ方式）。
          写真が1枚も無い（配列が空）間は、セクションごと非表示にする。 */}
      {GALLERY_ITEMS.length > 0 && (
        <section className="section-screen py-24 md:py-16 section-deep">
          <SectionInner>
            <div>
              <div className={`mb-10 ${CENTER_PC}`}>
                <p className="text-[10px] tracking-[0.45em] text-accent/80 mb-2">
                  GALLERY
                </p>
                <h2 className={`text-3xl md:text-4xl ${SERIF_HEADING}`}>きたげんの料理</h2>
                <div className={`flex items-center gap-3 mt-4 ${CENTER_PC_DIVIDER}`}>
                  <div className="w-8 h-px bg-accent/50" />
                  <div className="w-1 h-1 rounded-full bg-accent/70" />
                  <div className="w-8 h-px bg-accent/50" />
                </div>
                <p className={`${BODY_TEXT} mt-4 ${BODY_FONT}`}>
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

      {/* ── ⑥ くつろぎの空間（テキスト左・画像右） ─────────────
          md 未満：写真 → SPACE → 見出し → 文章 → ボタン（写真を order-first で先に出す）。
          スマホの写真は幅いっぱい。
          背景は section-light（GALLERY が無いときも、すぐ上の FOOD（section-warm）と色が分かれる） */}
      <section className="section-screen py-24 md:py-16 section-light">
        <SectionInner>
          <div>
            {/* 写真=7 / テキスト=5：写真を大きく、テキストは読みやすい幅に保つ */}
            <div className="grid grid-cols-1 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-12 md:gap-20 items-center">
              {/* テキスト */}
              <div>
                <p className="text-[10px] tracking-[0.5em] text-accent/80 mb-3">
                  SPACE
                </p>
                <h2 className={`text-3xl md:text-4xl leading-snug ${SERIF_HEADING}`}>
                  肩肘張らない、
                  <br />
                  居心地の良い空間。
                </h2>
                <SectionDivider />
                <p className={`${BODY_TEXT_SPLIT} leading-[2.1] md:leading-[2.2] mb-8 ${BODY_FONT}`}>
                  {proseLines([
                    "気の向くままに使える、そんな居心地を大事にしています。",
                    "カウンターは、お一人でも仕事帰りでも、",
                    "ふらっと立ち寄って一杯やるのにちょうどいい席。",
                    "2階には座敷があり、気の合う仲間との飲み会や、",
                    "ご家族での食事にぴったりです。",
                    "ひとりでも、大勢でも、それぞれの居心地がある一軒。",
                    {
                      node: (
                        <Link
                          href="/#group-reservation"
                          className="text-accent hover:text-accent-dark underline underline-offset-4 decoration-accent/40 transition-colors duration-200"
                        >
                          ご宴会や団体でのご利用は、貸切でのご相談も承っています。
                        </Link>
                      ),
                    },
                    "その日の気分や人数に合わせて、",
                    "思い思いにお過ごしください。",
                  ])}
                </p>
                <Link
                  href="/info"
                  className="btn-lift inline-flex items-center gap-2 text-sm text-accent border border-accent/40 px-5 py-2.5 rounded-sm hover:bg-accent/5 transition-colors"
                >
                  店舗情報を見る →
                </Link>
              </div>

              {/* 画像（public/counter.jpg を配置してください）。md 未満では文章より先に出す */}
              <div className="order-first md:order-none -mx-6 sm:mx-0">
                <SplitImage
                  src={SITE_IMAGES.space.counter}
                  alt="きたげんのカウンター席"
                />
              </div>
            </div>
          </div>
        </SectionInner>
      </section>


      {/* ── ⑦ 団体・宴会のご予約 ──────────────────────────────
          SPACE の文中リンク（/#group-reservation）の飛び先。
          囲みは横の真ん中（mx-auto）。囲みの中の文字は lg より狭い画面は左揃え、lg 以上は真ん中
          （電話のボタンは囲みの幅いっぱいのまま）。
          下の注意書き（ご予約時に〜）は小さく薄い色のまま。 */}
      <section id="group-reservation" className="section-screen py-20 md:py-16 section-warm scroll-mt-24">
        <SectionInner>
          <div>
            <div className={`rounded-xl border border-border bg-background/70 p-7 sm:p-8 max-w-xl mx-auto ${CENTER_PC}`}>
              <p className="text-[9px] tracking-[0.55em] text-accent/70 font-medium mb-3">
                PARTY &amp; GROUP
              </p>
              <p className={`text-lg text-foreground mb-1.5 ${SERIF_HEADING}`}>
                ご宴会・団体でのご利用は
              </p>
              <p className={`text-[15px] text-foreground mb-7 leading-relaxed ${BODY_FONT}`}>
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

              <p className={`text-sm text-muted/90 mt-5 leading-relaxed ${BODY_FONT}`}>
                {proseLines([
                  "ご予約時に「ホームページを見た」とお伝えください。",
                  "営業時間外（昼間・開店前）でも承ります。",
                ])}
              </p>
            </div>
          </div>
        </SectionInner>
      </section>

      {/* ── ⑧ Instagram と ⑨ 店主紹介へのリンク（1つの欄にまとめる）──────
          最新情報・急な営業の変更は Instagram で発信している。URL は lib/contact.ts。
          お知らせの一覧は /news のページに残している。
          ・lg 以上 … 左に INSTAGRAM、右に OWNER を左右に並べ、間に細い区切りの線。
            線は divide-x ではなく ::before で描き、欄の中身の上下いっぱい（高いほうの中身に合わせる）に伸ばす。
            それぞれの中身は横の真ん中にそろえる（本文の改行の位置は同じまま、各行を真ん中に）
          ・lg より狭い画面 … 上に INSTAGRAM、下に OWNER。左揃え
            （左の端をほかの欄とそろえるため、幅は SectionInner の標準 max-w-6xl）
          ・背景は section-light。上の PARTY & GROUP（section-warm）とも、
            下のフッター（card-bg ＝ section-warm と同じ色）とも色が分かれる */}
      <section className="section-screen py-24 md:py-16 section-light">
        <SectionInner>
          <div className="relative grid grid-cols-1 lg:grid-cols-2 items-center gap-y-20 lg:gap-y-0 lg:before:absolute lg:before:inset-y-0 lg:before:left-1/2 lg:before:w-px lg:before:bg-border">
            <div className={`lg:px-12 ${CENTER_PC}`}>
              <p className="text-[10px] tracking-[0.5em] text-accent/70 mb-2">
                INSTAGRAM
              </p>
              <h2 className={`text-3xl md:text-4xl tracking-wide ${SERIF_HEADING}`}>最新情報</h2>
              <div className={`flex items-center gap-3 mt-4 ${CENTER_PC_DIVIDER}`}>
                <div className="w-8 h-px bg-accent/50" />
                <div className="w-1 h-1 rounded-full bg-accent/70" />
                <div className="w-8 h-px bg-accent/50" />
              </div>
              <p className={`${BODY_TEXT} leading-[2.1] mt-6 mb-9 ${BODY_FONT}`}>
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
            <div className={`lg:px-12 ${CENTER_PC}`}>
              <p className="text-[10px] tracking-[0.5em] text-accent/80 mb-3">
                OWNER
              </p>
              {/* 飾り（線・点・線）。ほかの写真のない欄と同じ。lg 以上は真ん中、lg より狭い画面は左揃え */}
              <div className={`flex items-center gap-3 mb-5 ${CENTER_PC_DIVIDER}`}>
                <div className="w-8 h-px bg-accent/50" />
                <div className="w-1 h-1 rounded-full bg-accent/70" />
                <div className="w-8 h-px bg-accent/50" />
              </div>
              <p className={`${BODY_TEXT} mb-5 ${BODY_FONT}`}>
                きたげんの店主について。
              </p>
              <Link
                href="/owner"
                className="btn-lift inline-flex items-center justify-center gap-2 min-h-[44px] text-sm text-accent border border-accent/40 px-6 rounded-sm hover:bg-accent/5 transition-colors"
              >
                店主紹介を見る →
              </Link>
            </div>
          </div>
        </SectionInner>
      </section>
      </div>
    </div>
  );
}
