import { Phone } from "lucide-react";
import { PHONE } from "@/app/lib/contact";

// スマホ（md より狭い画面）で、画面のいちばん下に常に出す「電話する」ボタン。
// ・番号は lib/contact.ts の PHONE（1か所）から読む
// ・ボタンの高さは 52px。iPhone の下のバーに重ならないよう、
//   safe-area の分だけ下にあける（あけた部分も同じ色で塗る）
// ・md 以上（タブレット・パソコン）はヘッダーに電話番号があるので出さない
// ・ページの下の内容が隠れないよう、layout.tsx のフッターに同じ高さ（52px ＋ safe-area）のあきを足している。
//   トップのヒーローの「SCROLL」の目印と下の四隅の飾りも、この高さの分だけ上げている（page.tsx）。いずれも md より狭い画面だけ。
//   高さを変えるときは、この3か所の 52px をそろえること（Tailwind の都合で数字をそのまま書いている）
// ・data-call-bar：場面の絵をスクロールで進めるプログラム（scenes/sceneScroll.ts）が、この高さを「見えている画面」から除くために探す
// ・z-40：ヘッダー（z-50）とメニューの幕（z-80・z-90）より下

// 色：白い字と地の色の差が 4.5:1 以上になるよう、地は焦橙（accent-dark。白との差 4.9:1）。
// 以前の焼橙（accent）では 3.4:1 で足りなかった。押したとき（hover）は、もう一段深い色
export default function MobileCallBar() {
  return (
    <div data-call-bar className="fixed inset-x-0 bottom-0 z-40 md:hidden bg-accent-dark pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_16px_rgba(47,36,28,0.12)]">
      <a
        href={`tel:${PHONE}`}
        aria-label={`電話する（${PHONE}）`}
        className="flex items-center justify-center gap-2 w-full min-h-[52px] px-4
                   bg-accent-dark text-white hover:bg-[#8F4E12]
                   font-bold text-[15px] tracking-wider
                   transition-colors duration-200"
      >
        <Phone size={18} strokeWidth={2} aria-hidden="true" />
        電話する
      </a>
    </div>
  );
}
