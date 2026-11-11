"use client";

import { useEffect, useRef, type ReactNode } from "react";

// ─── せいろの場面の囲み（動きの切り替え） ───
// ・scroll-driven animations（animation-timeline: view()）が使えるブラウザ … 何もしない。
//   動きはすべて CSS（globals.css の「せいろの場面」）で、スクロールの位置に合わせて進む・戻る
// ・使えないブラウザ … 絵を「動く前」の形にしておき（data-seiro="wait"）、
//   場面が画面に入ったら1回だけ同じ動きをする（data-seiro="play"）。IntersectionObserver を使う
// ・prefers-reduced-motion: reduce のとき … 何もしない（動き終わった絵のまま）
// JavaScript が動かないときも、動き終わった絵のまま見える。
export default function SeiroPlayOnView({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof CSS !== "undefined" && CSS.supports("animation-timeline: view()")) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!("IntersectionObserver" in window)) return;

    el.dataset.seiro = "wait";
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          el.dataset.seiro = "play";
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={`seiro-scene ${className}`}>
      {children}
    </div>
  );
}
