import type { ReactNode } from "react";
import { ExternalLink, Phone } from "lucide-react";
import PageHeading from "../components/PageHeading";
import CardFrame from "../components/scenes/CardFrame";
import { WashiSheet, WashiItem, BrushRule, WASHI_LINK as LINK } from "../components/Washi";
import { PHONE, INSTAGRAM_URL, MAP_URL } from "../lib/contact";
import { businessHoursNow, REGULAR_CLOSED, LUNCH_SUSPENDED, hoursForDescription } from "../lib/businessHours";
import { pageMetadata } from "../lib/seo";
import BreadcrumbJsonLd from "../components/BreadcrumbJsonLd";
import { keepWords } from "../lib/keepWords";

// 明朝体（Noto Serif JP）。項目名（縦書き）・営業時間の大きな数字のために、
// このページでも読み込む（メニューのページと同じ 500・700）
import "@fontsource/noto-serif-jp/500.css";
import "@fontsource/noto-serif-jp/700.css";

// description の営業時間（「月〜土・祝日17:00〜22:00（L.O.21:30）、日曜休み」）は lib/businessHours.ts の
// hoursForDescription() から作る（ランチ再開などで、ページの表と食い違わないように）。
// 席数・お支払いは手で書いている。席やお支払いを変えたら、ここと下の「お席」「お支払い」の欄、
// components/StructuredData.tsx の paymentAccepted もそろえる
export const metadata = pageMetadata({
  title: "店舗情報・アクセス｜桃谷駅2分の居酒屋 IZAKAYA きたげん",
  description: `大阪市生野区勝山北、桃谷商店街の中。JR環状線「桃谷駅」から歩いて2分。営業は${hoursForDescription()}。41席（1階カウンター7席・2階座敷）。現金・クレジットカード・PayPayが使えます。`,
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
// ・ページの見出しの帯（section-warm。メニューのページと同じ形）は、見出しだけ
//   （以前は見出しの下に店の入口の絵を置いていたが、料理の絵と雰囲気が離れていたので外した）
// ・和紙・項目・区切りの線の部品は components/Washi.tsx（店主紹介のページは便箋にして、見た目を分けている）
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
//   それでも語の途中で折れてしまう所（Chrome の語の切れ目の判定が外れる所）と、auto-phrase が効かない
//   iPhone の Safari で語の途中で折れそうな所は、NoBreak で語のかたまりを折り返さない

// 本文の、折り返さない語のかたまり（lib/keepWords.tsx）。iPhone の Safari は auto-phrase が効かず、
// 字と字のあいだのどこででも折れるため、語の切れ目でだけ折れるよう、本文を語のかたまりに分けている。
// 文を変えたり足したりしたら、ここにも語を足すこと（足さなくても表示はできるが、Safari で語の途中で折れることがある）
const INFO_KEEP = [
  "しばらく", "お休みしています。", "急に", "お休みや", "時間を", "変える",
  "〒544-0033", "大阪府", "大阪市", "生野区",
  "JR環状線", "「桃谷駅」から、", "歩いて", "2分。", "駐車場は", "ありません。", "近くの",
  "41席。", "1階は", "カウンター", "7席、", "2階は", "座敷です。",
  "電子タバコは", "店内で", "どうぞ。", "紙タバコは、", "2階に", "喫煙所が", "あります。",
  "現金・", "クレジットカード・", "PayPay、", "どれも", "使えます。",
  "人数が", "多いときは、", "お電話ください。", "お席を", "ご用意します。",
  "お昼や", "開店前でも、", "予約の", "お電話を", "受け付けています。",
  "「ホームページを見た」", "とお伝えください。",
  "料理や", "お店の", "様子を、", "お休みの", "お知らせも、", "こちらから。",
] as const;
const k = (text: string) => keepWords(text, INFO_KEEP);

// 押せる範囲を高さ 44px 以上にする（上下の余白を足し、同じだけ負の余白で戻す。並びと見た目は今までのまま）。
// 地図アプリで開く：字の行 31px ＋ 16px。Instagram：24px ＋ 20px。電話番号（32px）は、その a に py-1.5 -my-1.5（＋12px）
const LINK_HIT_MAP = "py-2 -my-2";
const LINK_HIT_INSTAGRAM = "py-2.5 -my-2.5";

// 語のかたまりを折り返さない（狭い画面で、語の途中で折れてしまう所だけに使う。かたまりは短く、320px の本文の幅に収まる長さまで）。
// iPhone の Safari では auto-phrase が効かないので、Safari で語の途中で折れそうな所も、これで守る
function NoBreak({ children }: { children: ReactNode }) {
  return <span className="whitespace-nowrap">{children}</span>;
}

// 文の下に置くリンク・電話の行（本文との間を少しあける）
function ActionRow({ children }: { children: ReactNode }) {
  return <div className="!mt-5">{children}</div>;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default function InfoPage() {
  const hours = businessHoursNow();

  const items: { label: string; id?: string; body: ReactNode }[] = [
    {
      label: "営業時間",
      body: (
        <>
          {/* 時間の行（看板のように大きく）。曜日は小さく、L.O. は小さく添える */}
          <div className="space-y-4 md:space-y-3 pb-3">
            {hours.map((g) => (
              <p key={g.days} className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="w-full font-serif text-base md:text-lg font-bold tracking-[0.12em]">{g.days}</span>
                {/* 時刻の字：スマホ 40px・md 以上 60px。360px より狭い画面（320px）は、本文の幅（約 232px）に入るよう 34px */}
                <span className="font-serif text-[2.5rem] max-[359px]:text-[2.125rem] md:text-6xl font-bold leading-[1.1] tracking-[0.02em] tabular-nums whitespace-nowrap">
                  {g.open}〜{g.close}
                </span>
                <span className="text-sm text-muted tabular-nums whitespace-nowrap">（L.O. {g.lo}）</span>
              </p>
            ))}
          </div>
          <p className="font-semibold">{REGULAR_CLOSED}はお休みです。</p>
          {LUNCH_SUSPENDED && <p>{k("ランチは、しばらくお休みしています。")}</p>}
          <p className="text-muted">{k("急にお休みや時間を変える")}<NoBreak>ときは、Instagramで</NoBreak><NoBreak>お知らせすることがあります。</NoBreak></p>
        </>
      ),
    },
    {
      label: "場所",
      body: (
        <>
          <p className="font-medium">
            {k(ADDRESS[0])}
            <NoBreak>{ADDRESS[1]}</NoBreak>
          </p>
          <p>{k("JR環状線「桃谷駅」から、歩いて2分。")}</p>
          <p className="text-muted">{k("駐車場はありません。")}<NoBreak>お車の方は、</NoBreak>{k("近くの")}<NoBreak>コインパーキングを</NoBreak><NoBreak>ご利用ください。</NoBreak></p>
          <ActionRow>
            <a href={MAP_URL} target="_blank" rel="noopener noreferrer" className={`${LINK} ${LINK_HIT_MAP}`}>
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
          <p>{k("41席。1階はカウンター7席、2階は座敷です。")}</p>
          <p>{k("電子タバコは店内でどうぞ。紙タバコは、2階に喫煙所があります。")}</p>
        </>
      ),
    },
    {
      label: "お支払い",
      body: <p>{k("現金・クレジットカード・PayPay、どれも使えます。")}</p>,
    },
    {
      label: "ご予約",
      body: (
        <>
          <p>{k("人数が多いときは、お電話ください。お席をご用意します。")}</p>
          <p>{k("お昼や開店前でも、予約のお電話を受け付けています。")}</p>
          <p className="text-muted">{k("「ホームページを見た」とお伝えください。")}</p>
          <ActionRow>
            <a
              href={`tel:${PHONE}`}
              className="inline-flex items-center gap-2.5 py-1.5 -my-1.5 font-serif text-2xl md:text-3xl font-bold tracking-[0.06em] tabular-nums text-foreground hover:text-accent transition-colors duration-200"
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
      // お知らせのページ（やめた）から来た人の飛び先（next.config.ts の redirects で /info#news）
      id: "news",
      body: (
        <>
          <p>{k("料理やお店の様子を、")}<NoBreak>Instagramにのせています。</NoBreak></p>
          <p>{k("お休みのお知らせも、こちらから。")}</p>
          <ActionRow>
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className={`${LINK} ${LINK_HIT_INSTAGRAM} text-base md:text-lg`}>
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
          { name: "はじめに", path: "/" },
          { name: "ご案内", path: "/info" },
        ]}
      />

      {/* ── ページヘッダー（お品書きのページと同じ帯・同じ見出しの形。components/PageHeading.tsx）──────────
          添え書きは「仕事帰りに、ふらっと一杯。」（以前の「桃谷駅から、歩いて2分。」は、下の「場所」と重なるので外した。上下の余白は、お品書きのページと同じ） */}
      <PageHeading title="ご案内" lead="仕事帰りに、ふらっと一杯。" />

      {/* ── 1枚の和紙（店先の貼り紙）──────────────────────────── */}
      <WashiSheet>
        {items.map((it, i) => (
          <div key={it.label}>
            {i > 0 && <BrushRule seed={20000 + i * 97} />}
            <WashiItem label={it.label} id={it.id}>{it.body}</WashiItem>
          </div>
        ))}
      </WashiSheet>
    </div>
  );
}
