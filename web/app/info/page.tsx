import type { Metadata } from "next";
import Image from "next/image";
import { MapPin, ExternalLink, Phone } from "lucide-react";
import { listDocuments } from "../lib/adminDocuments";
import CalendarViewer from "../components/CalendarViewer";
import SectionInner from "../components/SectionInner";
import { PHONE } from "../lib/contact";
import {
  BUSINESS_HOURS,
  REGULAR_CLOSED,
  LUNCH_SUSPENDED,
  LUNCH_SUSPENDED_NOTICE,
} from "../lib/businessHours";

export const metadata: Metadata = {
  title: "店舗情報｜きたげん",
  description: "きたげんの営業時間・アクセス・席数・お支払い方法などをご確認いただけます。",
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 編集はここだけ
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// 営業時間・定休日・ランチ臨時休業フラグは lib/businessHours.ts で一元管理。
// （BUSINESS_HOURS / REGULAR_CLOSED / LUNCH_SUSPENDED を import して使用）

// ┌──────────────────────────────────────────────────────────┐
// │ 【店舗写真の差し込み口】                                    │
// │  ページ上部に表示する外観／店内写真。                       │
// │  父から外観写真（例: gaikan.jpg）が届いたら、               │
// │  下記パスを差し替えるだけで反映されます。                   │
// │  例: "/images/exterior/gaikan.jpg"                         │
// │  ※ 現状は既存の店舗写真 about/shop.jpg を使用。            │
// └──────────────────────────────────────────────────────────┘
const STORE_PHOTO = "/images/about/shop.jpg";

const SEATS = {
  count:    "41席",
  features: ["カウンター席あり", "貸切可能"],
  smoking:  ["電子タバコ：店内OK", "紙タバコ：2階喫煙所あり"],
  parking:  "なし",
};

const PAYMENT = ["現金", "クレジットカード"];

const ACCESS = {
  address:     "〒544-0033 大阪府大阪市生野区\n勝山北1丁目2-13",
  nearest:     "JR大阪環状線「桃谷駅」徒歩2分",
  parking:     "駐車場はございません。お近くのコインパーキングをご利用ください。",
  mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3281.89049709441!2d135.52679927628435!3d34.65746828553037!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6000df000a517bf7%3A0x81ed5ec961cb5e!2zSVpBS0FZQSDjgY3jgZ_jgZLjgpM!5e0!3m2!1sja!2sjp!4v1773280180352!5m2!1sja!2sjp",
  mapUrl:      "https://www.google.co.jp/maps/place/IZAKAYA+%E3%81%8D%E3%81%9F%E3%81%92%E3%82%93/@34.6574683,135.5267993,17z/data=!3m1!4b1!4m6!3m5!1s0x6000df000a517bf7:0x81ed5ec961cb5e!8m2!3d34.6574639!4d135.5293742!16s%2Fg%2F11vwjd2bch?entry=ttu&g_ep=EgoyMDI2MDMwOS4wIKXMDSoASAFQAw%3D%3D",
};

const INSTAGRAM_URL = "https://www.instagram.com/izakaya_kitagen";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// セクション見出し（ページ主要セクション用の大きい見出し）
function SectionLabel({ en, ja }: { en: string; ja: string }) {
  return (
    <div className="mb-8 md:mb-10">
      <p className="text-[10px] md:text-[11px] tracking-[0.55em] text-accent/70 mb-2">{en}</p>
      <h2 className="text-3xl md:text-4xl font-bold">{ja}</h2>
    </div>
  );
}

// カード内の小見出し（席・支払い・予約・SNS の 2×2 グリッド用）
function CardLabel({ en, ja }: { en: string; ja: string }) {
  return (
    <div className="mb-5">
      <p className="text-[10px] tracking-[0.5em] text-accent/70 mb-1.5">{en}</p>
      <h3 className="text-xl md:text-2xl font-bold">{ja}</h3>
    </div>
  );
}

// 和紙テーマに馴染むカード枠
const CARD =
  "rounded-2xl border border-border bg-background/70 p-6 md:p-8 shadow-[0_1px_2px_rgba(90,65,30,0.04)]";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default async function InfoPage() {
  const calendarDocs   = await listDocuments("calendar");
  const activeCalendar = calendarDocs.find((d) => d.isActive) ?? null;

  return (
    <div className="min-h-screen pt-16">

      {/* ── ページヘッダー ───────────────────────────────── */}
      <section className="section-warm py-16 md:py-20 border-b border-foreground/15">
        <SectionInner className="text-center">
          <p className="text-[10px] md:text-[11px] tracking-[0.45em] text-accent/80 mb-2">STORE INFO</p>
          <h1 className="text-3xl md:text-4xl font-bold">店舗情報</h1>
          <div className="flex items-center justify-center gap-3 mt-4">
            <div className="w-8 h-px bg-accent/50" />
            <div className="w-1 h-1 rounded-full bg-accent/70" />
            <div className="w-8 h-px bg-accent/50" />
          </div>
          <p className="text-sm md:text-base text-muted mt-4">営業時間・アクセス・各種ご案内</p>
        </SectionInner>
      </section>

      {/* ── メインコンテンツ ─────────────────────────────── */}
      <div className="section-light pb-24">
        <SectionInner>

          {/* ── 店舗写真 ───────────────────────────────────
              差し替えは上部の STORE_PHOTO 定数を編集するだけ。 */}
          <div className="pt-14 md:pt-20">
            <div className="relative aspect-[16/10] sm:aspect-[16/9] md:aspect-[21/9] rounded-2xl overflow-hidden border border-border">
              <Image
                src={STORE_PHOTO}
                alt="居酒屋きたげんの店舗"
                fill
                priority
                className="object-cover brightness-[0.96]"
                sizes="(max-width: 768px) 100vw, 1152px"
              />
            </div>
          </div>

          {/* ════════════════════════════════════════════════
              ① 営業時間 — 情報の主役。左に営業時間カード、右に補足＋カレンダー
          ════════════════════════════════════════════════ */}
          <section className="pt-16 md:pt-24 pb-16">
            <SectionLabel en="HOURS" ja="営業時間" />

            <div className="md:grid md:grid-cols-2 md:gap-10 lg:gap-14 items-start">

              {/* 営業時間テーブル（カード） */}
              <div className={CARD}>
                <div>
                  {BUSINESS_HOURS.map((g) => (
                    <div
                      key={g.days}
                      className="grid grid-cols-[6rem_1fr] items-baseline gap-x-6 py-4 border-b border-dashed border-border first:pt-0"
                    >
                      <span className="text-sm md:text-base font-semibold text-foreground">{g.days}</span>
                      <div className="flex items-baseline justify-between gap-4">
                        <span className="text-base md:text-lg font-medium tabular-nums">{g.open}〜{g.close}</span>
                        <span className="text-xs md:text-sm text-muted tabular-nums">L.O.&nbsp;{g.lo}</span>
                      </div>
                    </div>
                  ))}

                  {/* 定休日 */}
                  <div className="grid grid-cols-[6rem_1fr] items-baseline gap-x-6 py-4">
                    <span className="text-sm md:text-base text-muted">定休日</span>
                    <span className="text-base md:text-lg font-bold text-accent">{REGULAR_CLOSED}</span>
                  </div>
                </div>
              </div>

              {/* 補足＋カレンダー導線 */}
              <div className="mt-6 md:mt-0 space-y-4">
                {/* ランチ臨時休業のお知らせ（再開時は lib/businessHours.ts の LUNCH_SUSPENDED を false に） */}
                {LUNCH_SUSPENDED && (
                  <div className="rounded-xl border border-accent/25 bg-accent/5 px-5 py-4">
                    <p className="text-sm md:text-base text-accent-dark leading-relaxed">
                      ※ {LUNCH_SUSPENDED_NOTICE}
                    </p>
                  </div>
                )}

                <p className="text-sm text-muted/80 leading-relaxed">
                  ※ 急な営業時間の変更はInstagramでお知らせする場合があります
                </p>

                {activeCalendar && (
                  <div className="space-y-3 pt-1">
                    <p className="text-sm text-muted/80 leading-relaxed">
                      ※ 営業日・臨時休業はカレンダーでご確認いただけます
                    </p>
                    <CalendarViewer
                      fileUrl={activeCalendar.fileUrl}
                      resourceType={activeCalendar.resourceType}
                      format={activeCalendar.format}
                    />
                  </div>
                )}
              </div>

            </div>
          </section>

          {/* ════════════════════════════════════════════════
              ② アクセス — 左にテキスト、右に地図（PC 2カラム）
          ════════════════════════════════════════════════ */}
          <section className="py-16">
            <SectionLabel en="ACCESS" ja="アクセス" />

            <div className="md:grid md:grid-cols-2 md:gap-10 lg:gap-14 items-stretch">

              {/* 住所・最寄り駅・駐車場（カード） */}
              <div className={`${CARD} flex flex-col`}>
                <dl>
                  {[
                    { label: "住所",     value: ACCESS.address, pre: true  },
                    { label: "最寄り駅", value: ACCESS.nearest, pre: false },
                    { label: "駐車場",   value: ACCESS.parking, pre: false },
                  ].map(({ label, value, pre }) => (
                    <div
                      key={label}
                      className="grid grid-cols-[5rem_1fr] items-baseline gap-x-6 py-4 border-b border-dashed border-border first:pt-0"
                    >
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
              </div>

              {/* 地図 — カード内に収め、ワイドに合わせて拡大 */}
              <div className="mt-6 md:mt-0 rounded-2xl overflow-hidden border border-border">
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
              ③④⑤⑥ 席・お支払い・ご予約・公式アカウント（2×2 カード）
          ════════════════════════════════════════════════ */}
          <section className="py-16">
            <div className="grid md:grid-cols-2 gap-6">

              {/* ③ 席・設備 */}
              <div className={CARD}>
                <CardLabel en="SEATS" ja="席・設備" />
                <dl>
                  {[
                    { label: "席数",   value: SEATS.count    },
                    { label: "設備",   value: SEATS.features },
                    { label: "喫煙",   value: SEATS.smoking  },
                    { label: "駐車場", value: SEATS.parking  },
                  ].map(({ label, value }) => (
                    <div
                      key={label}
                      className="grid grid-cols-[5rem_1fr] items-baseline gap-x-6 py-3.5 border-b border-dashed border-border first:pt-0 last:border-b-0 last:pb-0"
                    >
                      <dt className="text-sm md:text-base text-muted">{label}</dt>
                      <dd className="text-base leading-relaxed space-y-0.5">
                        {Array.isArray(value)
                          ? value.map((v) => <p key={v}>{v}</p>)
                          : value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>

              {/* ④ お支払い */}
              <div className={CARD}>
                <CardLabel en="PAYMENT" ja="お支払い" />
                <div className="grid grid-cols-[5rem_1fr] items-baseline gap-x-6 py-3.5">
                  <span className="text-sm md:text-base text-muted">支払い</span>
                  <span className="text-base md:text-lg">{PAYMENT.join("・")}</span>
                </div>
                <p className="mt-4 text-sm text-muted/80 leading-relaxed">
                  各種クレジットカードがご利用いただけます。
                </p>
              </div>

              {/* ⑤ ご予約 */}
              <div className={CARD}>
                <CardLabel en="RESERVATION" ja="ご予約" />
                <p className="text-sm md:text-base text-muted mb-1.5 leading-relaxed">
                  ご宴会・団体でのご利用は、お電話でお席をご用意いたします。
                </p>
                <p className="text-xs md:text-sm text-muted/70 mb-6 leading-relaxed">
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
              </div>

              {/* ⑥ 公式アカウント */}
              <div className={CARD}>
                <CardLabel en="SOCIAL" ja="公式アカウント" />
                <p className="text-sm md:text-base text-muted leading-relaxed mb-1.5">
                  料理や店内の様子をInstagramで発信しています。
                </p>
                <p className="text-xs md:text-sm text-muted/70 mb-6 leading-relaxed">
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
              </div>

            </div>
          </section>

        </SectionInner>
      </div>
    </div>
  );
}
