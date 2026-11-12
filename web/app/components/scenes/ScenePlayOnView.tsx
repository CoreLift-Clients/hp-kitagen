"use client";

import { useEffect, useRef, type ReactNode } from "react";

// ─── 場面の絵の囲み（動きの切り替え） ───
// トップの線画の場面（components/scenes/Scene.tsx）が、絵をこの囲みに入れる。
// ・scroll-driven animations（animation-timeline: view()）が使えるブラウザ … 何もしない。
//   動きはすべて CSS（scenes.css）で、スクロールの位置に合わせて進む・戻る
// ・使えないブラウザ … 絵を「動く前」の形にしておき（data-scene="wait"）、
//   場面が画面に入ったら1回だけ同じ動きをする（data-scene="play"）。IntersectionObserver を使う
// ・prefers-reduced-motion: reduce のとき … 何もしない（動き終わった絵のまま）
// ・時間で揺れ続ける動き（湯気の揺れなど）は、場面が画面の外にあるあいだ止める（data-inview="false"）
// JavaScript が動かないときも、動き終わった絵のまま見える。
export default function ScenePlayOnView({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!("IntersectionObserver" in window)) return;

    // 揺れ続ける動きを、画面の外では止める
    const inview = new IntersectionObserver(
      (entries) => {
        for (const e of entries) el.dataset.inview = e.isIntersecting ? "true" : "false";
      },
      { rootMargin: "80px 0px" },
    );
    inview.observe(el);

    // scroll-driven animations が使えないブラウザだけ、画面に入ったときに1回だけ動かす
    let once: IntersectionObserver | undefined;
    if (!(typeof CSS !== "undefined" && CSS.supports("animation-timeline: view()"))) {
      el.dataset.scene = "wait";
      once = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            el.dataset.scene = "play";
            once?.disconnect();
          }
        },
        { threshold: 0.4 },
      );
      once.observe(el);
    }

    return () => {
      inview.disconnect();
      once?.disconnect();
    };
  }, []);

  return (
    <div ref={ref} className={`scene-art ${className}`}>
      {children}
    </div>
  );
}
