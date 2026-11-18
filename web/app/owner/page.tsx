import Image from "next/image";
import Link from "next/link";
import { OWNER_SECTIONS, OWNER_PHOTO, OWNER_PHOTO_ALT } from "../lib/owner";
import { pageMetadata } from "../lib/seo";
import BreadcrumbJsonLd from "../components/BreadcrumbJsonLd";
import PageHeading from "../components/PageHeading";
import SectionInner from "../components/SectionInner";
import { WASHI_LINK } from "../components/Washi";
import { keepWords } from "../lib/keepWords";
import "./letter.css";

// 明朝体（Noto Serif JP）。小見出しと署名のために、このページでも読み込む（店舗情報のページと同じ 500・700）
import "@fontsource/noto-serif-jp/500.css";
import "@fontsource/noto-serif-jp/700.css";

export const metadata = pageMetadata({
  title: "店主紹介 | IZAKAYA きたげん",
  description:
    "桃谷で生まれ育った、居酒屋きたげんの店主より。みんなの居場所になる店を目指して。鉄鍋餃子や自家製しゅうまいへの想い、女性お一人でも入りやすい店づくりについてお話しします。",
  path: "/owner",
});

// ─── ページの作り：店主からの手紙（便箋） ───
// 店舗情報は「店先の貼り紙」（components/Washi.tsx の和紙と、縦書きの項目名の列）。店主紹介は、見た目で分けるため便箋にする。
// ・ページの見出しの帯は共通の PageHeading（店舗情報・お品書きと同じ形・同じ余白）
// ・その下の地（section-deep）に、便箋を1枚（紙は section-light。和紙と同じ色。幅は max-w-page-wide ＝ 1040px まで）
// ・便箋の中の並び：書き出しの文 → 4つの段落（初めの行に小見出し〈明朝 700〉、次の行から本文。段落のあいだは1行あける）→ 署名
//   lg 以上は縦書き（右から左へ。署名は最後の行〈いちばん左〉の下寄せ）、lg 未満は横書き（署名は右寄せ）
// ・罫線・行の高さ・字の大きさ・便箋の高さは letter.css
// ・便箋の下（ページの地）に、結びの文と、控えめな文字のリンク2つ（店舗情報の「地図アプリで開く」と同じ見せ方）
// ・本文の文は店主の言葉なので、一字も変えない（lib/owner.ts）。語の途中で折れる所は、表示の側で KEEP の語のかたまりを折り返さない

// 折り返さない語のかたまり（狭い画面で、Chrome の語の切れ目の判定が外れて語の途中で折れる所と、
// auto-phrase が効かない iPhone の Safari で語の途中で折れそうな所）。
// 本文の中にこの語があれば、そこを折り返さない span で包む（lib/keepWords.tsx）。かたまりは短く（縦書きの1行・320px の横書きの1行に収まる長さ）
// 「ください」は、320px で「くださ／い。」と1字だけ次の行に残っていたので足した
// それ以外の語は、iPhone の Safari（auto-phrase が効かない）で語の途中で折れないよう、本文を語のかたまりに分けたもの
const KEEP = [
  "しゅうまい", "からあげ", "きたげん", "店名", "小学生", "あだ名", "入りにくい", "のぞいて", "手頃に", "揚げたて", "居場所", "ください",
  // 「きたげん」という名前
  "『きたげん』", "という", "店名は、", "実は", "私の", "小学生の", "頃からの", "あだ名なんです。", "この", "桃谷で", "生まれ育って、", "気づけば", "街で", "お店を", "開いていました。",
  // みんなの居場所になる店を
  "店を始めたとき、", "一番", "やりたかったのは、", "みんなが", "自然と", "集まってくる", "場所を", "つくること。", "特別な", "日じゃなくても、", "ふらっと", "立ち寄って、",
  "うまいものを", "食べて、", "気持ちよく", "帰って", "もらえる。", "そんな、", "地元の", "みんなの", "居場所みたいな", "店に", "したかったんです。",
  // 自慢は、鉄鍋餃子
  "料理は、", "美味しくて", "手頃に、", "大事に", "しています。", "一番の", "自慢は", "鉄鍋餃子。", "ひとつひとつ", "手を", "かけた", "自家製", "しゅうまいや、", "揚げたての",
  "からあげも、", "ぜひ", "味わって", "ほしい", "一品です。", "お酒が", "進む", "料理を、", "気取らずに", "楽しんで", "もらえたら", "うれしいです。",
  // お一人でも、気兼ねなく
  "そして、", "女性の", "お一人でも、", "気兼ねなく", "入って", "もらえる", "したいと", "思っています。", "居酒屋は", "一人だと", "ことも", "あると", "思いますが、",
  "きたげんは", "そんな", "心配の", "いらない", "店を", "目指しています。", "桃谷に", "お越しの", "際は、", "気軽に", "みて", "ください。", "お待ちしています。",
];

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

      {/* ── 便箋（店主からの手紙）と、便箋の下の結び ───────────────── */}
      <div className="section-deep py-14 md:py-24">
        <SectionInner>
          {/* 店主写真（フォルダ方式）。未設置の間は出さない。
              写真は web/public/images/owner/ に置き、app/lib/owner.ts の OWNER_PHOTO を設定すると、便箋の上に出る */}
          {hasPhoto && (
            <figure className="mb-10 md:mb-14 flex flex-col items-center">
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

          <article className="section-light mx-auto w-full max-w-page-wide px-6 py-9 md:px-14 md:py-14 lg:px-14 lg:py-12 shadow-[0_1px_6px_rgba(47,36,28,0.08)]">
            <div className="letter-body text-foreground [word-break:auto-phrase]">
              {/* 書き出しの文（大きめの字） */}
              <p className="letter-open font-medium">
                はじめまして。
                <br className="hidden sm:block" />
                {/* 360px で「きた／げん」と折れないよう、後ろの文は折り返さない（18px で 13 字。360px の便箋の幅に収まる） */}
                <span className="whitespace-nowrap">居酒屋きたげんの店主です。</span>
              </p>

              {/* 4つの段落（初めの行に小見出し、次の行から本文） */}
              {OWNER_SECTIONS.map((section) => (
                <section key={section.heading} className="letter-para">
                  <h2 className="font-serif font-bold">{section.heading}</h2>
                  {section.body.map((text, j) => (
                    <p key={j} className="letter-text">
                      {keepWords(text, KEEP)}
                    </p>
                  ))}
                </section>
              ))}

              {/* 署名（明朝。横書きは右寄せ、縦書きは下寄せ） */}
              <p className="letter-sign font-serif font-medium tracking-[0.12em]">店主　北口 隆</p>
            </div>
          </article>

          {/* 結び（便箋の下・外） */}
          <div className="mt-14 md:mt-20 text-center">
            <p className="text-sm md:text-base text-muted leading-[2.1]">
              気の向いたときに、ふらっと。
              <br />
              きたげんで、お待ちしています。
            </p>
            {/* リンクの押せる範囲は高さ 44px（py-3。上下の 12px ずつは -my-3 で戻し、見た目は今までのまま）。
                折り返したときに押せる範囲が重ならないよう、行のあきは 24px（gap-y-6） */}
            <div className="mt-7 flex flex-wrap items-center justify-center gap-x-10 gap-y-6 text-sm md:text-base">
              <Link href="/menu/dinner" className={`${WASHI_LINK} py-3 -my-3`}>
                お品書きを見る
              </Link>
              <Link href="/info" className={`${WASHI_LINK} py-3 -my-3`}>
                ご案内を見る
              </Link>
            </div>
          </div>
        </SectionInner>
      </div>
    </div>
  );
}
