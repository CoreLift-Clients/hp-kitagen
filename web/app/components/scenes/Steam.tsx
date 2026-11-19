// ─── 料理の絵の湯気（共通の部品） ───
// しゅうまい（SeiroIllustration.tsx）・からあげ（KaraageIllustration.tsx）・串焼き（KushiIllustration.tsx）・鉄鍋餃子（TeppanIllustration.tsx）で使い回す。
// 毛やひげに見えないよう、やわらかい線にする：
// ・根元はふわっと消す：食材から少し浮いた所から立ち、線の濃さは
//   根元 0（透明）→ 少し上で最も濃く → 上の端でまた 0（1本ずつの縦のグラデーション SteamFades。線にかける）
// ・形は、ゆるいS字のうねり（左右へのふくらみが1〜2回）。上へ行くほど少しだけ大きくうねる
// ・太さは scene-line より少し太い .scene-steam-line（scenes.css）、色はうすく（最も濃い所の濃さ peak）
// ・時間でゆっくり揺れる（scene-sway。場面が画面の外にあるあいだは止まる）。
//   立ちのぼる動きは scene-draw（下から上へ描き進める）。範囲は呼び出し側が timing で決める
// 下から上へ描くので、点は下から並べる。乱数は使わないので、毎回同じ形になる。

import type { CSSProperties } from "react";
import { PI, anim, jitter, r1, smooth, type P } from "./draw";

// 湯気1本の線（x0 … 根元の x、yStart → yEnd … 下から上、lean … 上の端で左右へ寄る量、
// phase・amp … うねりの位相と大きさ、seed … 揺らぎ）
export function wisp(x0: number, yStart: number, yEnd: number, lean: number, phase: number, amp: number, seed: number): string {
  const pts: P[] = [];
  const steps = 12;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    // 1本の中で左右へ1〜2回ふくらむ（sin の 0.65 周ぶん × 2）。根元はふくらみを小さく、上ほど大きく
    const x = x0 + lean * t * t + Math.sin(phase + t * PI * 2.6) * amp * (0.45 + 0.75 * t) + jitter(seed + i) * 0.3;
    pts.push([x, yStart + (yEnd - yStart) * t]);
  }
  return smooth(pts);
}

export type Wisp = { d: string; y0: number; y1: number; peak: number };
// 湯気1本（線と、縦のグラデーションの範囲・最も濃い所の濃さ peak）
export const mkWisp = (x0: number, y0: number, y1: number, lean: number, phase: number, amp: number, seed: number, peak: number): Wisp => ({
  d: wisp(x0, y0, y1, lean, phase, amp, seed),
  y0,
  y1,
  peak,
});

// 1本ずつの縦のグラデーション（根元 0 → 少し上で最も濃く → 上の端で 0）。<defs> の中に置く。id は `${id}-${i}`
export function SteamFades({ id, wisps }: { id: string; wisps: readonly Wisp[] }) {
  return (
    <>
      {wisps.map((w, i) => (
        <linearGradient key={i} id={`${id}-${i}`} gradientUnits="userSpaceOnUse" x1="0" y1={w.y0} x2="0" y2={w.y1}>
          <stop offset="0" stopColor="currentColor" stopOpacity="0" />
          <stop offset="0.22" stopColor="currentColor" stopOpacity={w.peak} />
          <stop offset="0.5" stopColor="currentColor" stopOpacity={r1(w.peak * 0.8)} />
          <stop offset="1" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      ))}
    </>
  );
}

// 湯気の線（1本ずつ揺れる g の中に、下から上へ描き進める線）。
// id … SteamFades と同じ id、sways … 1本ずつの揺れ（draw.ts の sway()）、timing … 1本ずつの立ちのぼる範囲 [--r0, --r1]
export function SteamWisps({
  id,
  wisps,
  sways,
  timing,
  className = "",
}: {
  id: string;
  wisps: readonly Wisp[];
  sways: readonly CSSProperties[];
  timing: readonly (readonly [number, number])[];
  className?: string;
}) {
  return (
    <g className={className}>
      {wisps.map((w, i) => (
        <g key={i} className="scene-sway" style={sways[i]}>
          <path
            d={w.d}
            pathLength={1}
            stroke={`url(#${id}-${i})`}
            className="scene-steam-line scene-stroke-draw scene-anim"
            style={anim("scene-draw", timing[i][0], timing[i][1])}
          />
        </g>
      ))}
    </g>
  );
}
