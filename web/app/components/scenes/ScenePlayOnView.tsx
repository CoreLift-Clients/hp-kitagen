"use client";

import { useEffect, useRef, type ReactNode } from "react";

// ─── 場面の絵の囲み（動きの切り替え） ───
// トップの線画の場面（components/scenes/Scene.tsx）が、絵をこの囲みに入れる。
// ・scroll-driven animations（animation-timeline: view()）が使えるブラウザ … 何もしない。
//   動きはすべて CSS（scenes.css）で、スクロールの位置に合わせて進む・戻る
//   （絵が画面の中に全部入ったところから、絵の真ん中が画面の真ん中に来たところまで）
// ・使えないブラウザ … 絵を「動く前」の形にしておき（data-scene="wait"）、
//   絵の 70% 以上が画面に入ったら1回だけ同じ動きをする（data-scene="play"）。IntersectionObserver を使う。
//   画面の上の固定ヘッダー（64px）に隠れる分は、画面に入っていないものとして数える。
//   絵が画面より大きくて 70% まで入りきらないときは、絵が画面の高さの 70% 以上をふさいだところで動かす
// ・prefers-reduced-motion: reduce のとき … 何もしない（動き終わった絵のまま）
// ・時間で揺れ続ける動き（湯気の揺れなど）は、場面が画面の外にあるあいだ止める（data-inview="false"）
// ・playOnce のとき … scroll-driven animations が使えるブラウザでも、使えないブラウザと同じく1回だけ時間で動かす。
//   ページのいちばん上に置く絵（店主紹介のページの手元の絵）は、開いたときにはもうスクロールの範囲
//   （絵の真ん中が画面の真ん中に来たところ）を過ぎていて、スクロールでは動きが見えないため
//   （data-scene の CSS は、スクロールで進める CSS より強いので、そちらが勝つ）
// JavaScript が動かないときも、動き終わった絵のまま見える。
export default function ScenePlayOnView({
  children,
  className = "",
  playOnce = false,
}: {
  children: ReactNode;
  className?: string;
  playOnce?: boolean;
}) {
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

    // scroll-driven animations が使えないブラウザ（と playOnce のとき）だけ、絵の 70% 以上が画面に入ったときに1回だけ動かす
    let once: IntersectionObserver | undefined;
    if (playOnce || !(typeof CSS !== "undefined" && CSS.supports("animation-timeline: view()"))) {
      el.dataset.scene = "wait";
      const PLAY_RATIO = 0.7;
      once = new IntersectionObserver(
        (entries) => {
          const ready = entries.some((e) => {
            if (!e.isIntersecting) return false;
            if (e.intersectionRatio >= PLAY_RATIO) return true;
            // 絵が画面より大きいとき：見えている部分が画面の高さの 70% 以上
            const rootH = e.rootBounds?.height ?? window.innerHeight;
            return e.intersectionRect.height >= rootH * PLAY_RATIO;
          });
          if (ready) {
            el.dataset.scene = "play";
            once?.disconnect();
          }
        },
        { threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, PLAY_RATIO, 0.8, 0.9, 1], rootMargin: "-64px 0px 0px 0px" },
      );
      once.observe(el);
    }

    return () => {
      inview.disconnect();
      once?.disconnect();
    };
  }, [playOnce]);

  return (
    <div ref={ref} className={`scene-art ${className}`}>
      {children}
    </div>
  );
}
