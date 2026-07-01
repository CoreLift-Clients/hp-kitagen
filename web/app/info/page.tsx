import type { Metadata } from "next";
import { MapPin, ExternalLink } from "lucide-react";
import { listDocuments } from "../lib/adminDocuments";
import CalendarViewer from "../components/CalendarViewer";
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

const SEATS = {
  count:    "41席",
  features: ["カウンター席あり", "貸切可能"],
  smoking:  ["電子タバコ：店内OK", "紙タバコ：2階喫煙所あり"],
  parking:  "なし",
};

const PAYMENT = ["現金", "クレジットカード"];

const PHONE = "070-1744-2839";

const ACCESS = {
  address:     "〒544-0033 大阪府大阪市生野区\n勝山北1丁目2-13",
  nearest:     "JR大阪環状線「桃谷駅」徒歩2分",
  parking:     "駐車場はございません。お近くのコインパーキングをご利用ください。",
  mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3281.89049709441!2d135.52679927628435!3d34.65746828553037!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6000df000a517bf7%3A0x81ed5ec961cb5e!2zSVpBS0FZQSDjgY3jgZ_jgZLjgpM!5e0!3m2!1sja!2sjp!4v1773280180352!5m2!1sja!2sjp",
  mapUrl:      "https://www.google.co.jp/maps/place/IZAKAYA+%E3%81%8D%E3%81%9F%E3%81%92%E3%82%93/@34.6574683,135.5267993,17z/data=!3m1!4b1!4m6!3m5!1s0x6000df000a517bf7:0x81ed5ec961cb5e!8m2!3d34.6574639!4d135.5293742!16s%2Fg%2F11vwjd2bch?entry=ttu&g_ep=EgoyMDI2MDMwOS4wIKXMDSoASAFQAw%3D%3D",
};

const INSTAGRAM_URL = "https://www.instagram.com/izakaya_kitagen";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// セクション見出しの共通パターン
function SectionLabel({ en, ja }: { en: string; ja: string }) {
  return (
    <div className="mb-10">
      <p className="text-[9px] tracking-[0.65em] text-accent/60 mb-2">{en}</p>
      <h2 className="text-2xl font-bold">{ja}</h2>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default async function InfoPage() {
  const calendarDocs   = await listDocuments("calendar");
  const activeCalendar = calendarDocs.find((d) => d.isActive) ?? null;

  return (
    <div className="min-h-screen pt-16">

      {/* ── ページヘッダー ───────────────────────────────── */}
      <section className="section-warm py-16 px-4 text-center border-b border-foreground/20">
        <p className="text-[10px] tracking-[0.45em] text-accent/80 mb-2">STORE INFO</p>
        <h1 className="text-3xl font-bold">店舗情報</h1>
        <div className="flex items-center justify-center gap-3 mt-4">
          <div className="w-8 h-px bg-accent/50" />
          <div className="w-1 h-1 rounded-full bg-accent/70" />
          <div className="w-8 h-px bg-accent/50" />
        </div>
        <p className="text-sm text-muted mt-4">営業時間・アクセス・各種ご案内</p>
      </section>

      {/* ── メインコンテンツ ─────────────────────────────── */}
      <div className="section-light">
      <div className="max-w-xl mx-auto px-6 pb-24">

        {/* ════════════════════════════════════════════════
            ① 営業時間
        ════════════════════════════════════════════════ */}
        <section className="pt-16 pb-14">
          <SectionLabel en="HOURS" ja="営業時間" />

          <div className="border-t border-dashed border-foreground/20">

            {/* 曜日グループごとの営業時間 */}
            {BUSINESS_HOURS.map((g) => (
              <div
                key={g.days}
                className="grid grid-cols-[5rem_1fr] items-baseline gap-x-6 py-4 border-b border-dashed border-foreground/20"
              >
                <span className="text-xs font-semibold text-foreground">{g.days}</span>
                <div className="flex items-baseline justify-between gap-4">
                  <span className="text-sm font-medium tabular-nums">{g.open}〜{g.close}</span>
                  <span className="text-xs text-muted tabular-nums">L.O.&nbsp;{g.lo}</span>
                </div>
              </div>
            ))}

            {/* 定休日 */}
            <div className="grid grid-cols-[5rem_1fr] items-baseline gap-x-6 py-4 border-b border-dashed border-foreground/20">
              <span className="text-xs text-muted">定休日</span>
              <span className="text-sm font-bold text-accent">{REGULAR_CLOSED}</span>
            </div>

          </div>

          {/* ランチ臨時休業のお知らせ（再開時は lib/businessHours.ts の LUNCH_SUSPENDED を false に） */}
          {LUNCH_SUSPENDED && (
            <p className="mt-5 text-xs text-accent/90 leading-relaxed">
              ※ {LUNCH_SUSPENDED_NOTICE}
            </p>
          )}

          {/* 補足 + カレンダー導線 */}
          {activeCalendar && (
            <div className="mt-5 space-y-3">
              <p className="text-xs text-muted/70 leading-relaxed">
                ※ 営業日・臨時休業はカレンダーでご確認いただけます
              </p>
              <p className="text-xs text-muted/60 leading-relaxed">
                ※ 急な営業時間の変更はInstagramでお知らせする場合があります
              </p>
              <CalendarViewer
                fileUrl={activeCalendar.fileUrl}
                resourceType={activeCalendar.resourceType}
                format={activeCalendar.format}
              />
            </div>
          )}

        </section>

        <div className="border-t-2 border-dashed border-foreground/30 -mx-6" />

        {/* ════════════════════════════════════════════════
            ② アクセス
        ════════════════════════════════════════════════ */}
        <section className="pt-16 pb-14">
          <SectionLabel en="ACCESS" ja="アクセス" />

          <dl className="border-t border-dashed border-foreground/20">
            {[
              { label: "住所",     value: ACCESS.address, pre: true  },
              { label: "最寄り駅", value: ACCESS.nearest, pre: false },
              { label: "駐車場",   value: ACCESS.parking, pre: false },
            ].map(({ label, value, pre }) => (
              <div
                key={label}
                className="grid grid-cols-[5rem_1fr] items-baseline gap-x-6 py-4 border-b border-dashed border-foreground/20"
              >
                <dt className="text-xs text-muted">{label}</dt>
                <dd className={`text-sm leading-relaxed ${pre ? "whitespace-pre-line font-medium" : ""}`}>
                  {value}
                </dd>
              </div>
            ))}
          </dl>

          {/* 地図 — コンテナ幅を突き抜けて全幅に */}
          <div className="mt-10 -mx-6">
            <iframe
              src={ACCESS.mapEmbedUrl}
              className="w-full h-[220px] block"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="きたげん アクセスマップ"
            />
          </div>

          <div className="mt-5">
            <a
              href={ACCESS.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-accent hover:text-accent-dark transition-colors duration-200"
            >
              <MapPin size={12} strokeWidth={1.5} />
              Googleマップで開く
              <ExternalLink size={10} strokeWidth={1.5} className="opacity-60" />
            </a>
          </div>
        </section>

        <div className="border-t-2 border-dashed border-foreground/30 -mx-6" />

        {/* ════════════════════════════════════════════════
            ③ 席・設備
        ════════════════════════════════════════════════ */}
        <section className="pt-16 pb-14">
          <SectionLabel en="SEATS" ja="席・設備" />

          <dl className="border-t border-dashed border-foreground/20">
            {[
              { label: "席数",   value: SEATS.count    },
              { label: "設備",   value: SEATS.features },
              { label: "喫煙",   value: SEATS.smoking  },
              { label: "駐車場", value: SEATS.parking  },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="grid grid-cols-[5rem_1fr] items-baseline gap-x-6 py-4 border-b border-dashed border-foreground/20"
              >
                <dt className="text-xs text-muted">{label}</dt>
                <dd className="text-sm leading-relaxed space-y-0.5">
                  {Array.isArray(value)
                    ? value.map((v) => <p key={v}>{v}</p>)
                    : value}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <div className="border-t-2 border-dashed border-foreground/30 -mx-6" />

        {/* ════════════════════════════════════════════════
            ④ お支払い
        ════════════════════════════════════════════════ */}
        <section className="pt-16 pb-14">
          <SectionLabel en="PAYMENT" ja="お支払い" />

          <div className="border-t border-dashed border-foreground/20">
            <div className="grid grid-cols-[5rem_1fr] items-baseline gap-x-6 py-4 border-b border-dashed border-foreground/20">
              <span className="text-xs text-muted">支払い</span>
              <span className="text-sm">{PAYMENT.join("・")}</span>
            </div>
          </div>
        </section>

        <div className="border-t-2 border-dashed border-foreground/30 -mx-6" />

        {/* ════════════════════════════════════════════════
            ⑤ ご予約
        ════════════════════════════════════════════════ */}
        <section className="pt-16 pb-14">
          <SectionLabel en="RESERVATION" ja="ご予約" />

          <p className="text-sm text-muted mb-1.5">
            お電話でご予約いただけます。
          </p>
          <p className="text-xs text-muted/60 mb-8 leading-relaxed">
            お電話の際は「ホームページを見た」とお伝えいただくとご案内がスムーズです。
          </p>

          <a
            href={`tel:${PHONE}`}
            className="block text-2xl font-bold tracking-wider text-foreground hover:text-accent transition-colors duration-200 tabular-nums"
          >
            {PHONE}
          </a>
          <p className="text-xs text-muted mt-2">タップで発信できます</p>
        </section>

        <div className="border-t-2 border-dashed border-foreground/30 -mx-6" />

        {/* ════════════════════════════════════════════════
            ⑥ 公式アカウント
        ════════════════════════════════════════════════ */}
        <section className="pt-16">
          <SectionLabel en="SOCIAL" ja="公式アカウント" />

          <p className="text-sm text-muted leading-relaxed mb-1.5">
            料理や店内の様子をInstagramで発信しています。
            <br />
            最新情報や営業日の変更なども随時更新していますので、ぜひご確認ください。
          </p>
          <p className="text-xs text-muted/60 mb-6">
            ※ 急な営業時間の変更はInstagramでお知らせする場合があります
          </p>

          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-accent hover:text-accent-dark transition-colors duration-200"
          >
            @izakaya_kitagen
            <ExternalLink size={12} strokeWidth={1.5} className="opacity-60" />
          </a>
        </section>

      </div>
      </div>
    </div>
  );
}
