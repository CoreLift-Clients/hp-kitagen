// web/app/content/specialties.ts
//
// トップページ ④FOOD の下に並べる「名物の一覧」のデータ。
//
// ─────────────────────────────────────────────────────────────
// 【品を足す手順】
//   1. 写真を web/public/images/specialties/ に置く
//        ・ファイル名は半角英数字とハイフン（例: shumai.jpg）
//        ・一覧では正方形に切り取って出すので、料理が真ん中に来る写真がよい
//   2. 下の SPECIALTIES 配列に、その品の1行を足す
//        例: { id: "shumai", name: "自家製しゅうまい", price: 580,
//              image: "/images/specialties/shumai.jpg", note: "蒸したてをどうぞ" },
//        ・id    … ほかの品と重ならない半角の名前（ファイル名の語幹とそろえると分かりやすい）
//        ・name  … 品名
//        ・price … 税込みの値段。数字だけを書く（「¥」「円」「,」は付けない）。表示は「¥580（税込）」になる
//        ・image … public/ から先のパス。"/images/specialties/〇〇.jpg"
//        ・note  … ひとこと。なければ行ごと書かなくてよい
//   3. 並び順は、配列に書いた順のまま
//
//   ※ 写真（image）と値段（price）の両方がそろった品だけを表示する。
//     値段が決まっていない・写真がまだの品は、書いておいても表示されない。
//   ※ 表示できる品が 0 のあいだは、一覧ごと出さない（FOOD の欄は今までと同じ見た目）。
//   ※ 並べ方は、パソコンは横に 4 列（md〜lg は 3 列）、スマホは 2 列。
//     4 品・8 品のように 4 の倍数だと収まりがよい。
// ─────────────────────────────────────────────────────────────

export interface Specialty {
  /** ほかの品と重ならない半角の名前 */
  id: string;
  /** 品名 */
  name: string;
  /** 税込みの値段（円）。数字だけ。決まっていない間は書かない */
  price?: number;
  /** public/ からの写真のパス（例: "/images/specialties/shumai.jpg"）。まだの間は書かない */
  image?: string;
  /** ひとこと（なくてもよい） */
  note?: string;
}

/** 写真と値段がそろって、表示できる品 */
export type DisplaySpecialty = Specialty & { price: number; image: string };

// 今は空。上の手順で1品ずつ足す。
export const SPECIALTIES: Specialty[] = [];

/** 写真と値段の両方がそろった品だけを返す */
export function displayableSpecialties(items: readonly Specialty[]): DisplaySpecialty[] {
  return items.filter(
    (item): item is DisplaySpecialty =>
      typeof item.price === "number" &&
      Number.isFinite(item.price) &&
      typeof item.image === "string" &&
      item.image.trim() !== "",
  );
}

/** 値段の表示（例: 580 → "¥580（税込）"、1200 → "¥1,200（税込）"） */
export function formatTaxIncludedPrice(price: number): string {
  return `¥${price.toLocaleString("ja-JP")}（税込）`;
}
