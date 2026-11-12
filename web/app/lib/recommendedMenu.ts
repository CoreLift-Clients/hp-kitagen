// web/app/lib/recommendedMenu.ts
//
// ディナーメニュー先頭の「名物・おすすめ」セクションで見せていた指定8品。
// ※ 今はどこからも使っていない。ディナーメニューの「名物・おすすめ」はジグザグの名物（components/scenes/Specialties.tsx）に
//    まとめ、写真の枠のカードの欄は外した。料理の写真がそろったときに使えるよう、カードの部品
//    （components/RecommendCard.tsx）とあわせて残している。
// 料理写真は「フォルダ方式」（owner.ts / gallery.ts と同じ考え方）で後入れする。
// 価格はメニューのデータ（app/content/menus.ts の dinner）を正とし、品名一致で引く。
//
// ─────────────────────────────────────────────────────────────
// 【料理写真が届いたときの反映手順】
//   1. 写真を web/public/images/food/ に、下の photo と同じファイル名で置く
//        （例: web/public/images/food/gyoza.jpg）
//   2. その品の hasPhoto を true に変更する
//   3. 保存すれば自動で写真表示に切り替わる
//      （hasPhoto が false の間は「写真準備中」プレースホルダーを表示）
//   ※ 写真は横位置で撮影推奨。カード側は 4:3 枠に object-cover 表示するため
//     多少の縦横比のズレは破綻しない。
//
// 【価格について】
//   price は基本的にメニューのデータから品名一致で自動取得する。
//   データに該当品が無い・品名が大きく異なる場合は値段欄が空になる（品名のみ表示）。
//   どうしても固定価格を出したいときは fallbackPrice に "¥000〜" 形式で入れる。
//   （データの価格が優先。fallbackPrice はデータで引けなかった場合のみ使用）
// ─────────────────────────────────────────────────────────────

export type RecommendedItem = {
  /** 表示品名。価格を引くための検索キーも兼ねる。 */
  name: string;
  /** public/ からの写真パス（未配置でもよい）。 */
  photo: string;
  /** 写真の alt テキスト。 */
  alt: string;
  /** 写真を配置したら true にする（false の間はプレースホルダー表示）。 */
  hasPhoto: boolean;
  /** true なら「名物」として大きめカードで強調表示。 */
  featured?: boolean;
  /** 名物カードに付けるバッジ文言（例:「店主の一番の自慢」）。 */
  badge?: string;
  /** メニューのデータで価格が引けなかった場合の保険。通常は未設定でよい。 */
  fallbackPrice?: string;
};

/** 名物（featured=true・大きめカード）＋おすすめ（小さめカード）の指定8品。 */
export const RECOMMENDED_ITEMS: RecommendedItem[] = [
  // ── 名物（特別扱い・大きめカード） ──────────────────────────
  {
    name: "鉄鍋餃子",
    photo: "/images/food/gyoza.jpg",
    alt: "きたげんの鉄鍋餃子",
    hasPhoto: false,
    featured: true,
    badge: "店主の一番の自慢",
    // メニューのデータで品名が一致しない場合に備え、実物メニュー表の税込価格を保険に。
    // メニュー表記「鉄鍋ぎょうざ(8個) 640円」
    fallbackPrice: "¥640〜",
  },
  {
    name: "自家製しゅうまい",
    photo: "/images/food/shumai.jpg",
    alt: "きたげんの自家製しゅうまい",
    hasPhoto: false,
    featured: true,
    badge: "名物",
    // メニューのデータで単品が引けない場合に備え、単品の実価格を保険に。
    // メニュー表記「自家製しゅうまい 単品(4個) 390円」
    fallbackPrice: "¥390〜",
  },

  // ── おすすめ（小さめカード） ────────────────────────────────
  {
    name: "豚の角煮",
    photo: "/images/food/kakuni.jpg",
    alt: "豚の角煮",
    hasPhoto: false,
  },
  {
    name: "鶏のからあげ",
    photo: "/images/food/karaage.jpg",
    alt: "鶏のからあげ",
    hasPhoto: false,
  },
  {
    name: "串三種盛り",
    photo: "/images/food/kushi-moriawase.jpg",
    alt: "串三種盛り",
    hasPhoto: false,
  },
  {
    name: "いかやき",
    photo: "/images/food/ikayaki.jpg",
    alt: "いかやき",
    hasPhoto: false,
  },
  {
    name: "肉みそ冷奴",
    photo: "/images/food/niku-miso-hiyayakko.jpg",
    alt: "肉みそ冷奴",
    hasPhoto: false,
  },
  {
    name: "サーモンクリームチーズ",
    photo: "/images/food/salmon-cream-cheese.jpg",
    alt: "サーモンクリームチーズ",
    hasPhoto: false,
    // メニューのデータで品名が一致しない場合に備え、実物メニュー表の税込価格を保険に。
    // メニュー表記「サーモンクリームチーズ 490円」
    fallbackPrice: "¥490〜",
  },
];

/** 品名の表記ゆれを吸収する正規化（括弧書き・空白を除去）。 */
function normalizeName(s: string): string {
  return s
    .replace(/[（(][^）)]*[）)]/g, "") // 「（3個）」「（各2本…）」などを除去
    .replace(/\s+/g, "")               // 全角・半角スペースを除去
    .trim();
}

/**
 * おすすめ品の価格をメニューのデータから引く。
 * 完全一致 →（括弧・空白を無視した）正規化一致 → データの品名が品名を包含、の順で探す。
 * 見つからなければ fallbackPrice、それも無ければ undefined（＝値段欄は空）。
 */
export function resolveRecommendedPrice(
  item: RecommendedItem,
  apiItems: { name: string; price?: string }[],
): string | undefined {
  const exact = apiItems.find((i) => i.name === item.name);
  if (exact?.price) return exact.price;

  const target = normalizeName(item.name);
  if (target) {
    const matched = apiItems.find((i) => {
      const n = normalizeName(i.name);
      return n === target || n.includes(target);
    });
    if (matched?.price) return matched.price;
  }

  return item.fallbackPrice;
}
