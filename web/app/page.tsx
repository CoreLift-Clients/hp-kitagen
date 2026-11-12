import Link from "next/link";
import { Phone, ExternalLink } from "lucide-react";
import { getSiteImages } from "./lib/site-images";
import HeroImage from "./components/HeroImage";
import SectionInner from "./components/SectionInner";
import Scene, { SceneLink, SCENE_LINK_CLASS } from "./components/scenes/Scene";
import Specialties from "./components/scenes/Specialties";
import SeatIllustration from "./components/scenes/SeatIllustration";
import ZashikiIllustration from "./components/scenes/ZashikiIllustration";
import EntranceIllustration from "./components/scenes/EntranceIllustration";
import { PHONE, INSTAGRAM_URL } from "./lib/contact";
import { STORY } from "./content/story";
import { getSpecialtyCardPrices } from "./content";

// 明朝体（Noto Serif JP）。このページでだけ読み込む。
// 太さは使うものだけ：OUR STORY の本文と場面の文 500、見出し 700。字の並び（読み込めないときの代わりの明朝体）は
// globals.css の --font-noto-serif-jp。Tailwind の font-serif で当てる。
import "@fontsource/noto-serif-jp/500.css";
import "@fontsource/noto-serif-jp/700.css";

// ─── トップの並び ───
// ヒーロー → OUR STORY → 名物（しゅうまい・鉄鍋餃子・生ビール）→ 席 → 宴 → 結び →（フッター）
// トップは「場面をめくるように淡々と進む」入口。OUR STORY のあとの場面は components/scenes/Scene.tsx の共通の部品で、
// 「動く線画・縦書きの短い見出し・2〜3行の短い文・詳しいページへの入口」の4つだけにする。詳しい説明は遷移先のページに任せる。
// 名物の欄は components/scenes/Specialties.tsx（3品を和紙のカードに載せ、斜めに少しずつ重ねる）。
// ・背景は OUR STORY の section-light から、light → deep → warm の順に回し、隣どうしで色を変える：
//   OUR STORY light → 名物 deep → 席 warm → 宴 light → 結び deep →（フッター card-bg ＝ warm と同じ色）
// ・席・宴・結びの並びは「左に絵、右に縦書き」と、その左右を入れ替えた形（reverse）を交互にする
// ・以前トップにあった FOOD・GALLERY・SPACE・PARTY & GROUP・INSTAGRAM と OWNER の欄は
//   components/home-sections/HomeSections.tsx に残している（トップでは使っていない）

// 宴の場面の「電話で相談する」ボタン。以前の PARTY & GROUP の電話のボタンと同じ見た目（幅は中身に合わせる）
const CALL_BUTTON_CLASS =
  "btn-lift inline-flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 py-4 px-8 rounded-sm bg-accent text-white hover:bg-accent-dark font-bold text-sm tracking-wider transition-colors duration-200 active:scale-[0.98]";

export default async function Home() {
  const SITE_IMAGES = await getSiteImages();
  const specialtyPrices = await getSpecialtyCardPrices();

  // 場面の絵の大きさ：md 以上 幅 400px、スマホ 画面の幅の 70%
  const ART = "block w-[70vw] md:w-[400px] h-auto text-foreground";

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

      {/* ── ヒーローにかぶさる内容（OUR STORY と線画の場面）──────────────────────
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

      {/* ── 線画の場面 ─────────────────────────────────────
          部品は components/scenes/Scene.tsx、絵は components/scenes/*Illustration.tsx、線と動きは scenes.css。
          文章を変えるときは、縦書きが 320px の画面からはみ出さないよう Scene.tsx の計算を見ること */}

      {/* 名物（しゅうまい・鉄鍋餃子・生ビールを和紙のカードに載せ、斜めに少しずつ重ねる1つの欄）。
          中身と置き方は components/scenes/Specialties.tsx、値段は content/specialty-prices.ts */}
      <Specialties tone="deep" prices={specialtyPrices} />

      {/* 席（左に絵） */}
      <Scene
        tone="warm"
        art={<SeatIllustration className={ART} />}
        heading="ひとりでも、大勢でも。"
        lines={["カウンターと、", "2階の座敷。"]}
        action={<SceneLink href="/info">店舗情報を見る →</SceneLink>}
      />

      {/* 宴（右に絵。2階の座敷）。以前の PARTY & GROUP の欄の飛び先（/#group-reservation）を引き継ぐ */}
      <Scene
        id="group-reservation"
        tone="light"
        reverse
        art={<ZashikiIllustration className={ART} />}
        heading="ご宴会・貸切も。"
        lines={["2階の座敷で、", "人数に合わせて。"]}
        action={
          <a href={`tel:${PHONE}`} className={CALL_BUTTON_CLASS}>
            <span className="inline-flex items-center gap-2">
              <Phone size={16} strokeWidth={2} aria-hidden="true" />
              電話で相談する
            </span>
            <span className="tabular-nums">{PHONE}</span>
          </a>
        }
      />

      {/* 結び（左に絵）。入口は横に3つ（md より狭い画面は縦に）。
          背景は section-deep（下のフッター（card-bg ＝ section-warm と同じ色）と分ける） */}
      <Scene
        tone="deep"
        art={<EntranceIllustration className={ART} />}
        heading="今日も桃谷で、"
        lines={["お待ちしています。"]}
        action={
          <ul className="flex flex-col md:flex-row items-center gap-5 md:gap-8">
            <li>
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-1.5 ${SCENE_LINK_CLASS}`}
              >
                Instagram
                <ExternalLink size={13} strokeWidth={1.75} aria-hidden="true" />
                <span className="sr-only">（新しいタブで開きます）</span>
              </a>
            </li>
            <li>
              <Link href="/owner" className={SCENE_LINK_CLASS}>
                店主紹介 →
              </Link>
            </li>
            <li>
              <Link href="/info" className={SCENE_LINK_CLASS}>
                店舗情報 →
              </Link>
            </li>
          </ul>
        }
      />
      </div>
    </div>
  );
}
