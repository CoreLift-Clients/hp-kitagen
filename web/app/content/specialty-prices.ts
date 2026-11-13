// web/app/content/specialty-prices.ts
//
// ディナーメニュー（/menu/dinner）のいちばん上の「きたげんの名物」の欄に並べる、イラストのカードのデータ。
// 欄は「料理」6品と「お飲みもの」3つに分かれていて、下の SPECIALTY_FOOD・SPECIALTY_DRINKS の順にカードが並ぶ
// （番号の 壱・弐・参… は、この並び順から自動で付く）。
//
// ─────────────────────────────────────────────────────────────
// 【値段の入れ方】
//   1. 下の SPECIALTY_FOOD か SPECIALTY_DRINKS の、その品の price: undefined を、税込みの値段の数字に書きかえる
//        例: price: 580,
//        ・数字だけを書く（「¥」「円」「,」は付けない）
//        ・カードのいちばん下に「¥580（税込）」の形で出る（1,000 円以上は「¥1,200（税込）」）
//   2. 「〜」を付けたい品（お飲みものは銘柄で値段が変わるので、今は全部こちら）は priceFrom: true にする
//        ・表示は「¥450〜（税込）」の形になる
//        ・priceFrom: false の品は「〜」なしの「¥580（税込）」になる
//   3. 値段が決まっていない品は undefined のままにする。その品のカードには値段の行ごと出さない
//
// 【品名・ひとことの直し方】
//   ・name: "…" が品名、tagline: "…" がひとこと（前後の " " は消さない）
//   ・ひとことはカードに1行で出す（スマホでは出さない）。長くすると1行に収まらないので、今と同じくらい（15字まで）にする
//
// 【絵の種類（art）】
//   ・その品のカードに出す線画。components/scenes/Specialties.tsx の ART で、名前と絵の部品を結びつけている
//   ・新しい名前を足すときは、SpecialtyArt と Specialties.tsx の両方に足す
//
//   ※ content/specialties.ts（トップの写真つきの名物の一覧）とは別のデータ。
//     あちらは「写真と値段の両方がそろった品だけを出す」決まりなので、写真のないこのカードには使っていない。
//     同じ品の値段を変えるときは、両方のファイルをそろえること
// ─────────────────────────────────────────────────────────────

/** カードの線画の種類 */
export type SpecialtyArt =
  | "seiro" // せいろ（自家製しゅうまい）
  | "teppan" // 鉄鍋（鉄鍋餃子）
  | "karaage" // からあげ
  | "kakuni" // 豚の角煮
  | "kushi" // 串の盛り合わせ
  | "hiyayakko" // 肉みそ冷奴
  | "beer" // 生ビール
  | "sake" // 一升瓶とお猪口（焼酎・日本酒）
  | "soft"; // 背の高いグラス（ソフトドリンク）

export interface SpecialtyItem {
  /** 品名 */
  name: string;
  /** ひとこと（1行。スマホでは出さない） */
  tagline: string;
  /** 税込みの値段（円）。決まっていない間は undefined */
  price: number | undefined;
  /** true なら値段を「¥450〜（税込）」のように「〜」付きで出す */
  priceFrom: boolean;
  /** カードの線画 */
  art: SpecialtyArt;
}

/** 料理（6品。並ぶ順：壱〜陸） */
export const SPECIALTY_FOOD: SpecialtyItem[] = [
  { name: "自家製しゅうまい", tagline: "蒸したてを、せいろで。", price: undefined, priceFrom: false, art: "seiro" },
  { name: "鉄鍋餃子", tagline: "底はこんがり、なかはふっくら。", price: undefined, priceFrom: false, art: "teppan" },
  { name: "からあげ", tagline: "カリッと、揚げたて。", price: undefined, priceFrom: false, art: "karaage" },
  { name: "豚の角煮", tagline: "箸でほろりと、やわらか。", price: undefined, priceFrom: false, art: "kakuni" },
  { name: "串の盛り合わせ", tagline: "いろいろ少しずつ、楽しめる。", price: undefined, priceFrom: false, art: "kushi" },
  { name: "肉みそ冷奴", tagline: "冷たい豆腐に、甘辛の肉みそ。", price: undefined, priceFrom: false, art: "hiyayakko" },
];

/** お飲みもの（3つ。並ぶ順：壱〜参） */
export const SPECIALTY_DRINKS: SpecialtyItem[] = [
  { name: "ビール", tagline: "まずは、よく冷えた一杯。", price: undefined, priceFrom: true, art: "beer" },
  { name: "焼酎・日本酒", tagline: "料理に合わせて、ゆっくりと。", price: undefined, priceFrom: true, art: "sake" },
  { name: "ソフトドリンク", tagline: "お酒が苦手な方も、ご一緒に。", price: undefined, priceFrom: true, art: "soft" },
];

// ─── 以前の「こだわりの文」（今は表示していない） ───
// 3品のジグザグの欄で、カードの横に出していた文。カードの形に変えたので出していないが、
// また使うときのために残している（どこからも使っていない）。
export const SPECIALTY_STORY_TEXTS = {
  shumai:
    "ひとつずつ包んだ自家製のしゅうまいを、せいろでふっくら蒸し上げます。ふたを開けたときの湯気ごと、熱々のうちにどうぞ。まずはこれと、冷えたビールで。",
  gyoza:
    "鉄鍋のまま席までお持ちするので、最後のひとつまで熱々です。底はこんがり、なかはふっくら。焼き色ひとつにも、手間を惜しみません。",
  beer: "一日の終わりは、よく冷えた生ビールから。きめ細かな泡を、ジョッキでたっぷりと。名物と合わせて、乾杯をどうぞ。",
} as const;

/** 値段の表示（例: 580 → "¥580（税込）"、priceFrom のとき 450 → "¥450〜（税込）"） */
export function formatSpecialtyPrice(price: number, priceFrom: boolean): string {
  return `¥${price.toLocaleString("ja-JP")}${priceFrom ? "〜" : ""}（税込）`;
}
