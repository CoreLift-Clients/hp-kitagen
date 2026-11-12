// web/app/content/specialty-prices.ts
//
// トップの「名物」の欄（しゅうまい・鉄鍋餃子・生ビールの3枚のカード）に出す値段のデータ。
//
// ─────────────────────────────────────────────────────────────
// 【値段の入れ方】
//   1. 下の SPECIALTY_CARD_PRICES の、その品の行の undefined を、税込みの値段の数字に書きかえる
//        例: shumai: 580,
//        ・数字だけを書く（「¥」「円」「,」は付けない）
//        ・表示はカードの下のほうに「¥580（税込）」の形で出る（1,000 円以上は「¥1,200（税込）」）
//   2. 値段が決まっていない品は undefined のままにする。その品のカードには値段の行ごと出さない
//
//   ※ 品の名前・見出し・文は、このファイルではなく components/scenes/Specialties.tsx にある。
//   ※ content/specialties.ts（写真つきの名物の一覧）とは別のデータ。
//     あちらは「写真と値段の両方がそろった品だけを出す」決まりなので、写真のないこのカードには使っていない。
//     同じ品の値段を変えるときは、両方のファイルをそろえること
// ─────────────────────────────────────────────────────────────

/** 名物のカードの品（並ぶ順：壱 しゅうまい → 弐 鉄鍋餃子 → 参 生ビール） */
export type SpecialtyCardId = "shumai" | "gyoza" | "beer";

/** 税込みの値段（円）。決まっていない間は undefined */
export const SPECIALTY_CARD_PRICES: Record<SpecialtyCardId, number | undefined> = {
  shumai: undefined,
  gyoza: undefined,
  beer: undefined,
};
