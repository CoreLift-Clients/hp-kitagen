import { Phone } from "lucide-react";
import { PHONE } from "@/app/lib/contact";

// スマホ・タブレット（lg より狭い画面）で、画面のいちばん下に常に出す「電話する」ボタン。
// ・番号は lib/contact.ts の PHONE（1か所）から読む
// ・ボタンの高さは 52px。iPhone の下のバーに重ならないよう、
//   safe-area の分だけ下にあける（あけた部分も同じ色で塗る）
// ・パソコン（lg 以上）はヘッダーに電話番号があるので出さない
// ・ページの下の内容が隠れないよう、layout.tsx のフッターに同じ高さ（52px ＋ safe-area）のあきを足している。
//   トップのヒーローの「SCROLL」の目印と下の四隅の飾りも、この高さの分だけ上げている（page.tsx）。
//   高さを変えるときは、この3か所の 52px をそろえること（Tailwind の都合で数字をそのまま書いている）
// ・z-40：ヘッダー（z-50）とメニューの幕（z-80・z-90）より下

export default function MobileCallBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 lg:hidden bg-accent pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_16px_rgba(47,36,28,0.12)]">
      <a
        href={`tel:${PHONE}`}
        aria-label={`電話する（${PHONE}）`}
        className="flex items-center justify-center gap-2 w-full min-h-[52px] px-4
                   bg-accent text-white hover:bg-accent-dark
                   font-bold text-[15px] tracking-wider
                   transition-colors duration-200"
      >
        <Phone size={18} strokeWidth={2} aria-hidden="true" />
        電話する
      </a>
    </div>
  );
}
