import type { ReactNode } from "react";
import { ExternalLink, Phone } from "lucide-react";
import SectionInner from "../components/SectionInner";
import PageHeading from "../components/PageHeading";
import CardFrame from "../components/scenes/CardFrame";
import ScenePlayOnView from "../components/scenes/ScenePlayOnView";
import StorefrontIllustration from "../components/scenes/StorefrontIllustration";
import { jitter, smooth, type P } from "../components/scenes/draw";
import { PHONE, INSTAGRAM_URL, MAP_URL } from "../lib/contact";
import { businessHoursNow, REGULAR_CLOSED, LUNCH_SUSPENDED } from "../lib/businessHours";
import { pageMetadata } from "../lib/seo";
import BreadcrumbJsonLd from "../components/BreadcrumbJsonLd";

// 明朝体（Noto Serif JP）。項目名（縦書き）・営業時間の大きな数字・入口の絵の「営業中」の札のために、
// このページでも読み込む（メニューのページと同じ 500・700）
import "@fontsource/noto-serif-jp/500.css";
import "@fontsource/noto-serif-jp/700.css";

export const metadata = pageMetadata({
  title: "店舗情報｜きたげん",
  description: "きたげんの営業時間・アクセス・席数・お支払い方法などをご確認いただけます。",
  path: "/info",
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 編集はここだけ（文は、お店の人が書いたお知らせの言葉づかいにそろえる）
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// 営業時間・定休日・ランチ休止中かどうかは lib/businessHours.ts で一元管理。
// 時間の行は businessHoursNow()（いまの時間が同じ曜日と祝日を1行にまとめたもの。ランチ休止中は「月〜土・祝日」の1行、
// ランチ再開〈LUNCH_SUSPENDED = false〉で、ランチのある曜日とない曜日の行に自動で分かれる）。
// 「ランチは、しばらくお休みしています。」の行は LUNCH_SUSPENDED が true のときだけ出す。

// 住所は、狭い画面で「勝山北／1丁目」のように番地の途中で折れないよう、前と後ろに分けて後ろを折り返さない
const ADDRESS = ["〒544-0033　大阪府大阪市生野区", "勝山北1丁目2-13"] as const;

// Google マップの埋め込み（2回目で、手描きの道案内の地図に替える予定）
const MAP_EMBED_URL =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3281.89049709441!2d135.52679927628435!3d34.65746828553037!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6000df000a517bf7%3A0x81ed5ec961cb5e!2zSVpBS0FZQSDjgY3jgZ_jgZLjgpM!5e0!3m2!1sja!2sjp!4v1773280180352!5m2!1sja!2sjp";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ─── ページの作り：店先の貼り紙 ───
// ・ページの見出しの帯（section-warm。メニューのページと同じ形）の、見出しのすぐ下に、店の入口の線画
//   （components/scenes/StorefrontIllustration.tsx。以前ここにあった店の写真の代わり）
// ・その下の地（section-deep。メニューのページの名物の欄と同じ）に、縦に長い1枚の和紙（section-light。
//   名物のカードと同じ紙の色）を置き、項目を上から順に並べる。囲みの格子・「項目：内容」の表は使わない
// ・項目のあいだは、筆で引いたような細い横線1本だけ（BrushRule。料理の絵の線と同じ揺らぎ・色）
// ・項目名は明朝体 700。md 以上は縦書きで各項目の左に（トップの OUR STORY の縦書きと同じ書き方）、
//   md より狭い画面は横書きで項目の上に
// ・営業時間の時間は、ページでいちばん大きな字（明朝体 700。看板のように）。L.O. は小さく添える
// ・本文は今までの本文の字（ゴシック体）のまま
// ・和紙の幅：md より狭い画面は左右の余白を除いた幅いっぱい、md〜lg も幅いっぱい、lg 以上は 1040px まで
//   （サイト共通の幅 max-w-page-wide。globals.css の --container-page-wide）。
//   広い画面で広がった分は、紙のふちの左右の余白（md 48px・lg 96px）と、縦書きの項目名と本文のあいだ
//   （md 48px・lg 80px）に回す。本文の1行は 38em（約 38 字）まで。地図の枠も本文の幅に合わせる。
//   区切りの線は紙の内側の幅いっぱい
// ・折り返しは語の切れ目で（auto-phrase。メニューのページのテイクアウトのご案内と同じ）。
//   それでも語の途中で折れてしまう所（Chrome の語の切れ目の判定が外れる所）は、NoBreak で語のかたまりを折り返さない

// 語のかたまりを折り返さない（狭い画面で、語の途中で折れてしまう所だけに使う。かたまりは短く、390px の本文の幅に収まる長さまで）
function NoBreak({ children }: { children: ReactNode }) {
  return <span className="whitespace-nowrap">{children}</span>;
}

// 区切りの線（筆で引いたような細い横線）。seed を変えると揺らぎ方が変わる（乱数なし）。
// viewBox は横 100・縦 6 で描き、幅いっぱいに伸ばす（線の太さは scenes.css の .info-rule-line で変わらない）
function rulePath(seed: number): string {
  const pts: P[] = [];
  const n = 7;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    // 引き始めは少し上から入り、終わりはわずかに下がる（筆の入りと抜け）
    const y = 3 + (t - 0.5) * 0.5 + jitter(seed + i) * 0.55 * (i === 0 || i === n ? 0.3 : 1);
    pts.push([0.6 + 98.8 * t, y]);
  }
  return smooth(pts);
}

function BrushRule({ seed }: { seed: number }) {
  return (
    <svg
      viewBox="0 0 100 6"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
      className="block h-[6px] w-full overflow-visible text-foreground"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
    >
      <path d={rulePath(seed)} className="info-rule-line" />
    </svg>
  );
}

// 項目（左に縦書きの項目名、右に中身。md より狭い画面は項目名が上）
function Item({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section className="py-9 md:py-12 lg:py-14 md:grid md:grid-cols-[2.5rem_1fr] lg:grid-cols-[3rem_1fr] md:gap-x-12 lg:gap-x-20">
      <h2 className="mb-4 md:mb-0 font-serif text-lg md:text-xl lg:text-[1.375rem] font-bold text-foreground tracking-[0.18em] md:[writing-mode:vertical-rl] md:leading-[1.7]">
        {label}
      </h2>
      <div className="min-w-0 max-w-[38em] space-y-2 text-base text-foreground leading-[1.95] [word-break:auto-phrase] text-pretty">{children}</div>
    </section>
  );
}

// 文の下に置くリンク・電話の行（本文との間を少しあける）
function ActionRow({ children }: { children: ReactNode }) {
  return <div className="!mt-5">{children}</div>;
}

const LINK = "inline-flex items-center gap-1.5 text-accent hover:text-accent-dark underline underline-offset-4 decoration-accent/40 hover:decoration-accent transition-colors duration-200";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default function InfoPage() {
  const hours = businessHoursNow();

  const items: { label: string; body: ReactNode }[] = [
    {
      label: "営業時間",
      body: (
        <>
          {/* 時間の行（看板のように大きく）。曜日は小さく、L.O. は小さく添える */}
          <div className="space-y-4 md:space-y-3 pb-3">
            {hours.map((g) => (
              <p key={g.days} className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="w-full font-serif text-base md:text-lg font-bold tracking-[0.12em]">{g.days}</span>
                <span className="font-serif text-[2.5rem] md:text-6xl font-bold leading-[1.1] tracking-[0.02em] tabular-nums whitespace-nowrap">
                  {g.open}〜{g.close}
                </span>
                <span className="text-sm text-muted tabular-nums whitespace-nowrap">（L.O. {g.lo}）</span>
              </p>
            ))}
          </div>
          <p className="font-semibold">{REGULAR_CLOSED}はお休みです。</p>
          {LUNCH_SUSPENDED && <p>ランチは、しばらくお休みしています。</p>}
          <p className="text-muted">急にお休みや時間を変える<NoBreak>ときは、Instagramで</NoBreak><NoBreak>お知らせすることがあります。</NoBreak></p>
        </>
      ),
    },
    {
      label: "場所",
      body: (
        <>
          <p className="font-medium">
            {ADDRESS[0]}
            <NoBreak>{ADDRESS[1]}</NoBreak>
          </p>
          <p>JR環状線「桃谷駅」から、歩いて2分。</p>
          <p className="text-muted">駐車場はありません。お車の方は、近くのコインパーキングをご利用ください。</p>
          <ActionRow>
            <a href={MAP_URL} target="_blank" rel="noopener noreferrer" className={LINK}>
              地図アプリで開く
              <ExternalLink size={13} strokeWidth={1.5} className="opacity-60" />
            </a>
          </ActionRow>
          {/* 地図（Google マップの埋め込み）。和紙の地になじむよう、細い手描きの枠（CardFrame）で囲む。
              枠の線が地図に隠れないよう、地図は枠の内側に少しあけて置く */}
          <div className="relative !mt-7 p-2">
            <CardFrame seed={13000} />
            <iframe
              src={MAP_EMBED_URL}
              className="block w-full h-[260px] md:h-[320px] opacity-95"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="きたげん アクセスマップ"
            />
          </div>
        </>
      ),
    },
    {
      label: "お席",
      body: (
        <>
          <p>41席。1階はカウンター7席、2階は座敷です。</p>
          <p>電子タバコは店内でどうぞ。紙タバコは、2階に喫煙所があります。</p>
        </>
      ),
    },
    {
      label: "お支払い",
      body: <p>現金・クレジットカード、どちらも使えます。</p>,
    },
    {
      label: "ご予約",
      body: (
        <>
          <p>人数が多いときは、お電話ください。お席をご用意します。</p>
          <p>お昼や開店前でも、予約のお電話を受け付けています。</p>
          <p className="text-muted">「ホームページを見た」と言っていただけると、話が早いです。</p>
          <ActionRow>
            <a
              href={`tel:${PHONE}`}
              className="inline-flex items-center gap-2.5 font-serif text-2xl md:text-3xl font-bold tracking-[0.06em] tabular-nums text-foreground hover:text-accent transition-colors duration-200"
            >
              <Phone size={20} strokeWidth={1.75} className="text-accent" aria-hidden="true" />
              {PHONE}
            </a>
          </ActionRow>
        </>
      ),
    },
    {
      label: "お知らせ",
      body: (
        <>
          <p>料理やお店の様子を、<NoBreak>Instagramにのせています。</NoBreak></p>
          <p>お休みのお知らせも、こちらから。</p>
          <ActionRow>
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className={`${LINK} text-base md:text-lg`}>
              @izakaya_kitagen
              <ExternalLink size={14} strokeWidth={1.5} className="opacity-60" />
            </a>
          </ActionRow>
        </>
      ),
    },
  ];

  return (
    <div className="min-h-screen">
      <BreadcrumbJsonLd
        items={[
          { name: "トップ", path: "/" },
          { name: "店舗情報", path: "/info" },
        ]}
      />

      {/* ── ページヘッダー（お品書きのページと同じ帯。components/PageHeading.tsx）と、店の入口の線画 ──────────
          絵は components/scenes/StorefrontIllustration.tsx（飾りなので aria-hidden）。
          幅は 680px まで（狭い画面は左右の余白を除いた幅いっぱい）。真ん中に置く。
          class の scene は、絵の中の「後ろの線を隠す塗り」をこの帯の背景（section-warm）の色にするため（scenes.css）。
          ページのいちばん上なので、開いたときにはもうスクロールの範囲（絵の真ん中が画面の真ん中に来たところ）を
          過ぎている。そのため、店主紹介のページの手元の絵と同じく、画面に入ったときに1回だけ時間で動かす（playOnce） */}
      <PageHeading className="scene" title="店舗情報" lead="桃谷駅から、歩いて2分。">
        <ScenePlayOnView playOnce className="mx-auto mt-10 md:mt-12 w-full max-w-[680px]">
          <StorefrontIllustration className="storefront-svg block w-full h-auto text-foreground" />
        </ScenePlayOnView>
      </PageHeading>

      {/* ── 1枚の和紙（店先の貼り紙）──────────────────────────── */}
      <div className="section-deep py-14 md:py-24">
        <SectionInner>
          <article className="section-light mx-auto w-full max-w-page-wide px-5 py-3 md:px-12 md:py-6 lg:px-24 lg:py-8 shadow-[0_1px_6px_rgba(47,36,28,0.08)]">
            {items.map((it, i) => (
              <div key={it.label}>
                {i > 0 && <BrushRule seed={20000 + i * 97} />}
                <Item label={it.label}>{it.body}</Item>
              </div>
            ))}
          </article>
        </SectionInner>
      </div>
    </div>
  );
}
