// web/app/lib/gallery.ts
//
// トップページ ⑤GALLERY（料理ギャラリー）の表示データ。
// 口コミシステムのAPIには依存せず、public/images/gallery/ に置いた写真を表示する。
// （hero / about / food / space と同じ「フォルダ方式」）
//
// ─────────────────────────────────────────────────────────────
// 【写真が届いたときの反映手順】
//   1. 写真ファイルを web/public/images/gallery/ に置く（下記の想定ファイル名で保存）
//   2. 下の GALLERY_ITEMS 配列に、その料理の1行を追記する
//        例: { id: "shumai", name: "自家製しゅうまい", image: "/images/gallery/shumai.jpg" },
//   3. 保存すれば自動で表示される
//
//   ※ GALLERY_ITEMS が空の間は、トップの⑤GALLERYセクションごと非表示になる。
//     （未完成のプレースホルダーを公開サイトに出さないため）
//   ※ PC表示は3列グリッドなので、3枚 or 6枚が収まりが良い。
// ─────────────────────────────────────────────────────────────
//
// 【撮影ガイド6品 ⇔ ファイル名の対応（お父さんへの受け渡し用に固定）】
//   料理名              置くファイル名                           追記する image パス
//   ─────────────────────────────────────────────────────────────────────────
//   肉みそ冷奴          niku-miso-hiyayakko.jpg   → /images/gallery/niku-miso-hiyayakko.jpg
//   いかやき玉子入り    ikayaki.jpg               → /images/gallery/ikayaki.jpg
//   自家製しゅうまい    shumai.jpg                → /images/gallery/shumai.jpg
//   豚の角煮            kakuni.jpg                → /images/gallery/kakuni.jpg
//   串三種盛り          kushi-moriawase.jpg       → /images/gallery/kushi-moriawase.jpg
//   鶏のからあげ        karaage.jpg               → /images/gallery/karaage.jpg
//
//   ↓ 写真が届いたら、上の対応表を見ながらコメントアウトを外して有効化するだけ。
//   // { id: "niku-miso-hiyayakko", name: "肉みそ冷奴",       image: "/images/gallery/niku-miso-hiyayakko.jpg" },
//   // { id: "ikayaki",             name: "いかやき玉子入り", image: "/images/gallery/ikayaki.jpg" },
//   // { id: "shumai",              name: "自家製しゅうまい", image: "/images/gallery/shumai.jpg" },
//   // { id: "kakuni",              name: "豚の角煮",         image: "/images/gallery/kakuni.jpg" },
//   // { id: "kushi-moriawase",     name: "串三種盛り",       image: "/images/gallery/kushi-moriawase.jpg" },
//   // { id: "karaage",             name: "鶏のからあげ",     image: "/images/gallery/karaage.jpg" },
// ─────────────────────────────────────────────────────────────

export interface GalleryItem {
  /** 一意のキー（ファイル名の語幹と揃えると分かりやすい） */
  id: string;
  /** カードに表示する料理名 */
  name: string;
  /** public/ からの画像パス（例: "/images/gallery/shumai.jpg"） */
  image: string;
}

// 初期は空配列。写真が届いたら上記手順で1品ずつ追記する。
// 空のあいだは⑤GALLERYセクションごと非表示になる（page.tsx 側で length > 0 判定）。
export const GALLERY_ITEMS: GalleryItem[] = [];
