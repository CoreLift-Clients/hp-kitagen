"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { ensureDebug, registerScene, sceneMode } from "./sceneScroll";

// ─── 場面の絵の囲み（動きの切り替え） ───
// トップの線画の場面（Scene.tsx）と、名物の欄のカード（Specialties.tsx）が、絵をこの囲みに入れる。
// 店主紹介のページ（縦長の画面）の一筆箋・署名と判子も、この囲みに入れて同じ仕組みで動かす（絵〈svg〉はない。app/owner/letter.css）。
// どの仕組みで動かすかは sceneScroll.ts の sceneMode で決める：
// ・css（scroll-driven animations〈animation-timeline: view()〉が使えるブラウザ）… 何もしない。
//   動きはすべて CSS（scenes.css）で、スクロールの位置に合わせて進む・戻る
// ・js（使えないが、Web Animations API が使えるブラウザ。iOS 26 より前の Safari など）…
//   sceneScroll.ts が、CSS と同じ決まりでスクロールの位置から進み具合を計算して当てる（data-scene="js"）。上に戻すと動きも戻る
// ・time（それも使えない古いブラウザ）… 今までどおり、絵を「動く前」の形にしておき（data-scene="wait"）、
//   絵の 70% 以上が画面に入ったら1回だけ時間で動かす（data-scene="play"）。
//   画面の上の固定ヘッダーに隠れる分は、画面に入っていないものとして数える。
//   絵が画面より大きくて 70% まで入りきらないときは、絵が画面の高さの 70% 以上をふさいだところで動かす
// ・none（prefers-reduced-motion: reduce）… 何もしない（動き終わった絵のまま）
// ・時間で揺れ続ける動き（湯気の揺れなど）は、場面が画面の外にあるあいだ止める（data-inview="false"）
// JavaScript が動かないときも、動き終わった絵のまま見える。
// name … ?debug=1 の表示に出す絵の名前
export default function ScenePlayOnView({
  children,
  className = "",
  name = "",
}: {
  children: ReactNode;
  className?: string;
  name?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const mode = sceneMode();
    ensureDebug();
    if (mode === "none") return;
    if (!("IntersectionObserver" in window)) return;

    // 揺れ続ける動きを、画面の外では止める
    const inview = new IntersectionObserver(
      (entries) => {
        for (const e of entries) el.dataset.inview = e.isIntersecting ? "true" : "false";
      },
      { rootMargin: "80px 0px" },
    );
    inview.observe(el);

    // css・js：スクロールの位置で進める（css は ?debug=1 の表示のためだけに登録する）
    const unregister = registerScene(el, name);

    // time：絵の 70% 以上が画面に入ったときに1回だけ動かす
    let once: IntersectionObserver | undefined;
    if (mode === "time") {
      el.dataset.scene = "wait";
      const PLAY_RATIO = 0.7;
      // 固定ヘッダー（globals.css の --header-h。px で書いてある）に隠れる分は、画面に入っていないものとして数える
      const headerH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) || 64;
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
        { threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, PLAY_RATIO, 0.8, 0.9, 1], rootMargin: `-${headerH}px 0px 0px 0px` },
      );
      once.observe(el);
    }

    return () => {
      inview.disconnect();
      once?.disconnect();
      unregister();
    };
  }, [name]);

  return (
    <div ref={ref} className={`scene-art ${className}`}>
      {children}
    </div>
  );
}
