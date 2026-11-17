"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

// ─── ページを移ったら、いちばん上（スクロール 0）から始める ───
// Next.js は、ページを移ったとき「新しいページの中身の頭」へスクロールする（layout-router の scrollIntoView）。
// このサイトは固定ヘッダーの分だけ main に上の余白（--header-h）があるので、中身の頭はスクロール 0 ではなく
// 64px（lg 以上 76px）の所になり、ページの上の端がヘッダーの下に隠れたまま始まっていた。
// また、同じページへのリンク（トップでロゴを押す）では、Next.js はスクロールしない。
// そこで、ページが変わったとき（pathname が変わったとき）と、同じページへのリンクを押したときに、一瞬で上へ戻す。
// ・ブラウザの「戻る」「進む」（popstate）では何もしない（前に見ていた位置に戻す、ブラウザと Next.js の振る舞いのまま）
// ・URL に「#」があるとき（/menu/dinner#takeout など）は何もしない（その場所へ飛ぶ）
// ・滑らかに流れないよう behavior: "instant"（html の scroll-behavior: smooth より優先される）
// 置き場所は layout.tsx（どのページにも1つ）
export default function ScrollToTop() {
  const pathname = usePathname();
  const fromPopState = useRef(false);
  const first = useRef(true);

  useEffect(() => {
    const onPopState = () => {
      fromPopState.current = true;
    };
    // 同じページへのリンク（pathname も search も同じで、# の無いもの）を、ふつうに押したとき
    const onClick = (e: MouseEvent) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a");
      if (!a || !a.href || (a.target && a.target !== "_self")) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin || url.hash) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      }
    };
    window.addEventListener("popstate", onPopState);
    document.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("popstate", onPopState);
      document.removeEventListener("click", onClick);
    };
  }, []);

  useEffect(() => {
    // 最初に開いたときは、ブラウザに任せる（再読み込みの位置・# の場所）
    if (first.current) {
      first.current = false;
      return;
    }
    if (fromPopState.current) {
      fromPopState.current = false;
      return;
    }
    if (window.location.hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  return null;
}
