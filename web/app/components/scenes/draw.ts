// ─── 線画の場面で使う、線の描き方の道具 ───
// トップの場面（components/scenes/ の *Illustration.tsx）の SVG の線を作る。
// 筆ペンらしい揺らぎは、決まった数式でわずかにずらした点を、なめらかな曲線でつないで出す
// （乱数は使わないので、毎回同じ絵になる）。サーバーで描くだけ（ブラウザでは計算しない）。

import type { CSSProperties } from "react";

export type P = readonly [number, number];

export const PI = Math.PI;

export const r1 = (n: number) => Math.round(n * 10) / 10;

// -1〜1 の決まった揺らぎ
export function jitter(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return (x - Math.floor(x)) * 2 - 1;
}

// 点をなめらかな曲線でつなぐ（Catmull-Rom → 3次ベジェ）
export function smooth(pts: readonly P[]): string {
  const n = pts.length;
  const at = (i: number) => pts[Math.max(0, Math.min(n - 1, i))];
  let d = `M${r1(pts[0][0])} ${r1(pts[0][1])}`;
  for (let i = 0; i < n - 1; i++) {
    const p0 = at(i - 1);
    const p1 = at(i);
    const p2 = at(i + 1);
    const p3 = at(i + 2);
    d += ` C${r1(p1[0] + (p2[0] - p0[0]) / 6)} ${r1(p1[1] + (p2[1] - p0[1]) / 6)}`;
    d += ` ${r1(p2[0] - (p3[0] - p1[0]) / 6)} ${r1(p2[1] - (p3[1] - p1[1]) / 6)}`;
    d += ` ${r1(p2[0])} ${r1(p2[1])}`;
  }
  return d;
}

// 点を直線でつないで閉じた形にする（後ろの線を隠す塗り用。揺らぎなし）
export function polygon(pts: readonly P[]): string {
  return `M${pts.map(([x, y]) => `${r1(x)} ${r1(y)}`).join(" L")} Z`;
}

// だ円の一部（角度 t0→t1、ラジアン。y は下向きなので 0〜π が手前、π〜2π が奥）
export function arcPts(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  t0: number,
  t1: number,
  steps: number,
  amp: number,
  seed: number,
  wave?: { k: number; a: number },
): P[] {
  const pts: P[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = t0 + ((t1 - t0) * i) / steps;
    const w = wave ? 1 + wave.a * Math.sin(wave.k * t) : 1;
    const j = jitter(seed + i) * amp;
    pts.push([cx + (rx * w + j) * Math.cos(t), cy + (ry * w + j * 0.4) * Math.sin(t)]);
  }
  return pts;
}

export const arc = (...a: Parameters<typeof arcPts>) => smooth(arcPts(...a));

// 1周（書き始めと書き終わりを少し重ねて、筆で描いた輪のようにする）
export const ring = (cx: number, cy: number, rx: number, ry: number, seed: number, amp = 1.2) =>
  arc(cx, cy, rx, ry, PI * 0.96, PI * 3.02, 24, amp, seed);

// 少し揺れた線（2点の間に揺らぎのある点を入れる）
export function line(a: P, b: P, seed: number, amp = 0.9, mid = 2): string {
  const pts: P[] = [a];
  for (let i = 1; i <= mid; i++) {
    const t = i / (mid + 1);
    pts.push([a[0] + (b[0] - a[0]) * t + jitter(seed + i) * amp, a[1] + (b[1] - a[1]) * t + jitter(seed + i + 9) * amp]);
  }
  pts.push(b);
  return smooth(pts);
}

// 下から上へ立ちのぼる湯気の線（点は下から並べる。描く向きも下から上）
export function steam(x0: number, yStart: number, yEnd: number, phase: number, amp: number, seed: number): string {
  const pts: P[] = [];
  const steps = 9;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const y = yStart + (yEnd - yStart) * t;
    const x = x0 + Math.sin(phase + t * 5.2) * amp * (0.35 + t) + jitter(seed + i) * 0.8;
    pts.push([x, y]);
  }
  return smooth(pts);
}

// ─── 動きの指定 ───
// 動かす部品（g や path）に、class の "scene-anim" と一緒に style={anim(...)} で付ける。
// ・name … 動き（scenes.css の @keyframes の名前）
// ・from・to … 動きの順番と長さを決める数（4〜60 の中で使う）。スクロールで進めるときは、
//   4 が「絵が画面の中に全部入ったところ」、60 が「絵の真ん中が画面の真ん中に来たところ」になる
//   （scenes.css で view() の contain 0%〜50% に割り当てる。60 より後ろは 60 として扱う）。
//   使えないブラウザで1回だけ時間で動くときも、この数字から始まる時刻と長さを決める（scenes.css）
// ・vars … 動きの中で使う値（--dy など）
export function anim(name: string, from: number, to: number, vars: Record<string, string> = {}): CSSProperties {
  return { "--a": name, "--r0": from, "--r1": to, ...vars } as CSSProperties;
}

// 時間で揺れ続ける動き（class の "scene-sway" と一緒に付ける）。長さと、ずらす時間（秒）
export function sway(duration: number, delay: number): CSSProperties {
  return { "--sway-dur": `${duration}s`, "--sway-delay": `${delay}s` } as CSSProperties;
}
