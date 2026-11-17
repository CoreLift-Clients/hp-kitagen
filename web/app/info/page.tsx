import Image from "next/image";
import type { ReactNode } from "react";
import { MapPin, ExternalLink, Phone } from "lucide-react";
import SectionInner from "../components/SectionInner";
import CardFrame from "../components/scenes/CardFrame";
import { PHONE, INSTAGRAM_URL, MAP_URL } from "../lib/contact";
import {
  businessHoursNow,
  REGULAR_CLOSED,
  LUNCH_SUSPENDED,
  LUNCH_SUSPENDED_NOTICE,
} from "../lib/businessHours";
import { pageMetadata } from "../lib/seo";
import BreadcrumbJsonLd from "../components/BreadcrumbJsonLd";

// 明朝体（Noto Serif JP）。囲みの見出しのために、このページでも読み込む（メニューのページと同じ 500・700）
import "@fontsource/noto-serif-jp/500.css";
import "@fontsource/noto-serif-jp/700.css";

export const metadata = pageMetadata({
  title: "店舗情報｜きたげん",
  description: "きたげんの営業時間・アクセス・席数・お支払い方法などをご確認いただけます。",
  path: "/info",
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 編集はここだけ
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// 営業時間・定休日・ランチ臨時休業フラグは lib/businessHours.ts で一元管理。
// 表の行は businessHoursNow()（いまの時間が同じ曜日を1行にまとめたもの。ランチ休止中は「月〜土」の1行）。
// ランチ休止中のお知らせは、表の右の注意書き（LUNCH_SUSPENDED_NOTICE）の1か所だけに出す。

// ┌──────────────────────────────────────────────────────────┐
// │ 【店舗写真の差し込み口】                                    │
// │  ページ上部に表示する外観／店内写真。                       │
// │  父から外観写真（例: gaikan.jpg）が届いたら、               │
// │  下記パスを差し替えるだけで反映されます。                   │
// │  例: "/images/exterior/gaikan.jpg"                         │
// │  ※ 現状は既存の店舗写真 about/shop.jpg を使用。            │
// └──────────────────────────────────────────────────────────┘
const STORE_PHOTO = "/images/about/shop.jpg";

// 席数の行に、1階・2階の席の種類も入れる（カウンターの席数は未確認なので書かない）。
// 貸切は書かない方針。駐車場はアクセスの欄に書く。
const SEATS = {
  count:   "41席（1階カウンター・2階座敷）",
  smoking: ["電子タバコ：店内OK", "紙タバコ：2階喫煙所あり"],
};

const PAYMENT = ["現金", "クレジットカード"];

const ACCESS = {
  address:     "〒544-0033 大阪府大阪市生野区\n勝山北1丁目2-13",
  nearest:     "JR大阪環状線「桃谷駅」徒歩2分",
  parking:     "駐車場はございません。お近くのコインパーキングをご利用ください。",
  mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3281.89049709441!2d135.52679927628435!3d34.65746828553037!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6000df000a517bf7%3A0x81ed5ec961cb5e!2zSVpBS0FZQSDjgY3jgZ_jgZLjgpM!5e0!3m2!1sja!2sjp!4v1773280180352!5m2!1sja!2sjp",
  mapUrl:      MAP_URL,
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ─── 見た目はメニューのページ（/menu/dinner）にそろえる ───
// ・ページの見出し：メニューのページと同じ section-warm の帯・同じ大きさ
// ・中身の地：section-deep（メニューのページの名物の欄と同じ）。中の幅も同じ（md 720px・lg 960px まで）
// ・囲み：名物のカードと同じ和紙（section-light）に、筆ペンで描いた枠（components/scenes/CardFrame.tsx）
// ・欄の見出し：名物の欄の小見出し（Specialties.tsx の CardGroup）と同じ、明朝体・accent-dark・下線
// ・囲みの見出し：名物のカードの品名と同じ、明朝体 700

// 欄の見出し（営業時間・アクセス）
function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <h2 className="font-serif text-base md:text-lg font-bold text-accent-dark mb-6 md:mb-8 pb-2 border-b border-accent/25">
      {children}
    </h2>
  );
}

// 囲みの中の見出し（席・設備・お支払い・ご予約・公式アカウント）
function CardHeading({ children }: { children: ReactNode }) {
  return (
    <h3 className="font-serif font-bold text-foreground text-lg md:text-xl tracking-wider mb-5">
      {children}
    </h3>
  );
}

// 和紙の囲み（筆ペンの枠）。seed は囲みごとに変えて、枠の揺らぎ方を少しずつ違える
function PaperCard({ seed, className = "", children }: { seed: number; className?: string; children: ReactNode }) {
  return (
    <div
      className={`scene-card section-light relative px-5 py-6 md:px-8 md:py-8 shadow-[0_1px_4px_rgba(47,36,28,0.06)] ${className}`}
    >
      <CardFrame seed={seed} />
      {children}
    </div>
  );
}

// 表の1行（左に項目名、右に中身）。狭い画面では左の幅とあきを少し詰める。
// 折り返しは語の切れ目で（auto-phrase。メニューのページのテイクアウトのご案内と同じ）
const ROW =
  "grid grid-cols-[4.5rem_1fr] gap-x-4 md:grid-cols-[6rem_1fr] md:gap-x-6 items-baseline border-b border-dashed border-border [word-break:auto-phrase]";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default function InfoPage() {
  const hours = businessHoursNow();

  return (
    <div className="min-h-screen">
      <BreadcrumbJsonLd
        items={[
          { name: "トップ", path: "/" },
          { name: "店舗情報", path: "/info" },
        ]}
      />

      {/* ── ページヘッダー（メニューのページと同じ形） ─────────────── */}
      <section className="section-warm border-b border-border py-16 md:py-20 text-center">
        <SectionInner>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">店舗情報</h1>
          <p className="text-sm md:text-base text-muted">営業時間・アクセス・各種ご案内</p>
        </SectionInner>
      </section>

      {/* ── メインコンテンツ ─────────────────────────────── */}
      <div className="section-deep py-20 md:py-24">
        <SectionInner>
          <div className="mx-auto w-full md:max-w-[720px] lg:max-w-[960px] flex flex-col gap-16 md:gap-20">

            {/* ── 店舗写真 ───────────────────────────────────
                差し替えは上部の STORE_PHOTO 定数を編集するだけ。
                幅は下の囲みと同じ。ふちは囲みに合わせて角をほぼ立てる */}
            <div className="relative aspect-[16/10] sm:aspect-[16/9] md:aspect-[21/9] rounded-sm overflow-hidden border border-border shadow-[0_1px_4px_rgba(47,36,28,0.06)]">
              <Image
                src={STORE_PHOTO}
                alt="居酒屋きたげんの店舗"
                fill
                priority
                className="object-cover brightness-[0.96]"
                sizes="(max-width: 768px) 100vw, 960px"
              />
            </div>

            {/* ════════════════════════════════════════════════
                ① 営業時間 — 左に営業時間の囲み、右に注意書き
            ════════════════════════════════════════════════ */}
            <section>
              <SectionHeading>営業時間</SectionHeading>

              <div className="md:grid md:grid-cols-2 md:gap-8 items-start">

                <PaperCard seed={11000}>
                  {/* 行は div で囲む（囲みの最初の子は枠の SVG なので、first: を行どうしで効かせるため） */}
                  <div>
                    {hours.map((g) => (
                      <div key={g.days} className={`${ROW} py-4 first:pt-0`}>
                        <span className="text-sm md:text-base font-semibold text-foreground">{g.days}</span>
                        <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                          <span className="text-base md:text-lg font-medium tabular-nums">{g.open}〜{g.close}</span>
                          <span className="text-xs md:text-sm text-muted tabular-nums">L.O.&nbsp;{g.lo}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 定休日 */}
                  <div className={`${ROW} border-b-0 pt-4`}>
                    <span className="text-sm md:text-base text-muted">定休日</span>
                    <span className="text-base md:text-lg font-bold text-accent">{REGULAR_CLOSED}</span>
                  </div>
                </PaperCard>

                {/* 注意書き */}
                <div className="mt-6 md:mt-0 space-y-4">
                  {/* ランチ臨時休業のお知らせ（再開時は lib/businessHours.ts の LUNCH_SUSPENDED を false に） */}
                  {LUNCH_SUSPENDED && (
                    <div className="rounded-sm border border-accent/25 bg-accent/5 px-5 py-4">
                      <p className="text-sm md:text-base text-accent-dark leading-relaxed">
                        ※ {LUNCH_SUSPENDED_NOTICE}
                      </p>
                    </div>
                  )}

                  <p className="text-sm text-muted/90 leading-relaxed">
                    ※ 急な営業時間の変更はInstagramでお知らせする場合があります
                  </p>
                </div>

              </div>
            </section>

            {/* ════════════════════════════════════════════════
                ② アクセス — 左に住所などの囲み、右に地図（md 以上 2列）
            ════════════════════════════════════════════════ */}
            <section>
              <SectionHeading>アクセス</SectionHeading>

              <div className="md:grid md:grid-cols-2 md:gap-8 items-stretch">

                <PaperCard seed={13000} className="flex flex-col">
                  <dl>
                    {[
                      { label: "住所",     value: ACCESS.address, pre: true  },
                      { label: "最寄り駅", value: ACCESS.nearest, pre: false },
                      { label: "駐車場",   value: ACCESS.parking, pre: false },
                    ].map(({ label, value, pre }) => (
                      <div key={label} className={`${ROW} py-4 first:pt-0`}>
                        <dt className="text-sm md:text-base text-muted">{label}</dt>
                        <dd className={`text-base md:text-lg leading-relaxed ${pre ? "whitespace-pre-line font-medium" : ""}`}>
                          {value}
                        </dd>
                      </div>
                    ))}
                  </dl>

                  <div className="mt-auto pt-6">
                    <a
                      href={ACCESS.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm md:text-base text-accent hover:text-accent-dark transition-colors duration-200"
                    >
                      <MapPin size={14} strokeWidth={1.5} />
                      Googleマップで開く
                      <ExternalLink size={11} strokeWidth={1.5} className="opacity-60" />
                    </a>
                  </div>
                </PaperCard>

                {/* 地図 */}
                <div className="mt-6 md:mt-0 rounded-sm overflow-hidden border border-border shadow-[0_1px_4px_rgba(47,36,28,0.06)]">
                  <iframe
                    src={ACCESS.mapEmbedUrl}
                    className="w-full h-[320px] md:h-full md:min-h-[360px] block"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="きたげん アクセスマップ"
                  />
                </div>

              </div>
            </section>

            {/* ════════════════════════════════════════════════
                ③④⑤⑥ 席・お支払い・ご予約・公式アカウント（md 以上 2×2）
            ════════════════════════════════════════════════ */}
            <section className="grid md:grid-cols-2 gap-6 md:gap-8">

              {/* ③ 席・設備 */}
              <PaperCard seed={15000}>
                <CardHeading>席・設備</CardHeading>
                <dl>
                  {[
                    { label: "席数", value: SEATS.count   },
                    { label: "喫煙", value: SEATS.smoking },
                  ].map(({ label, value }) => (
                    <div key={label} className={`${ROW} py-3.5 first:pt-0 last:border-b-0 last:pb-0`}>
                      <dt className="text-sm md:text-base text-muted">{label}</dt>
                      <dd className="text-base leading-relaxed space-y-0.5">
                        {Array.isArray(value)
                          ? value.map((v) => <p key={v}>{v}</p>)
                          : value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </PaperCard>

              {/* ④ お支払い */}
              <PaperCard seed={17000}>
                <CardHeading>お支払い</CardHeading>
                <div className={`${ROW} border-b-0`}>
                  <span className="text-sm md:text-base text-muted">支払い</span>
                  <span className="text-base md:text-lg">{PAYMENT.join("・")}</span>
                </div>
                <p className="mt-4 text-sm text-muted/90 leading-relaxed">
                  各種クレジットカードがご利用いただけます。
                </p>
              </PaperCard>

              {/* ⑤ ご予約 */}
              <PaperCard seed={19000}>
                <CardHeading>ご予約</CardHeading>
                <p className="text-sm md:text-base text-muted mb-1.5 leading-relaxed">
                  ご宴会・団体でのご利用は、お電話でお席をご用意いたします。
                </p>
                <p className="text-xs md:text-sm text-muted/90 mb-6 leading-relaxed">
                  「ホームページを見た」とお伝えいただくとご案内がスムーズです。
                  営業時間外（昼間・開店前）でも、ご予約のお電話を承ります。
                </p>
                <a
                  href={`tel:${PHONE}`}
                  className="inline-flex items-center gap-2.5 text-2xl md:text-3xl font-bold tracking-wider text-foreground hover:text-accent transition-colors duration-200 tabular-nums"
                >
                  <Phone size={20} strokeWidth={1.75} className="text-accent" />
                  {PHONE}
                </a>
                <p className="text-xs md:text-sm text-muted mt-2">タップで発信できます</p>
              </PaperCard>

              {/* ⑥ 公式アカウント */}
              <PaperCard seed={21000}>
                <CardHeading>公式アカウント</CardHeading>
                <p className="text-sm md:text-base text-muted leading-relaxed mb-1.5">
                  料理や店内の様子をInstagramで発信しています。
                </p>
                <p className="text-xs md:text-sm text-muted/90 mb-6 leading-relaxed">
                  最新情報や営業日の変更なども随時更新していますので、ぜひご確認ください。
                </p>
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-base md:text-lg text-accent hover:text-accent-dark transition-colors duration-200"
                >
                  @izakaya_kitagen
                  <ExternalLink size={14} strokeWidth={1.5} className="opacity-60" />
                </a>
              </PaperCard>

            </section>

          </div>
        </SectionInner>
      </div>
    </div>
  );
}
