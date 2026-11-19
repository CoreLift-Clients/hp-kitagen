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
//   4 が「絵が画面の中に全部入ったところ」（名物の欄のカードは「絵の線のいちばん下が画面に入ったところ」）、
//   60 が「絵の真ん中が画面の真ん中に来たところ」になる
//   （scenes.css で view() の contain 0%〜50% に割り当てる。60 より後ろは 60 として扱う）。
//   使えないブラウザで1回だけ時間で動くときも、この数字から始まる時刻と長さを決める（scenes.css）
// ・vars … 動きの中で使う値（--dy など）
export function anim(name: string, from: number, to: number, vars: Record<string, string> = {}): CSSProperties {
  return { "--a": name, "--r0": from, "--r1": to, ...vars } as CSSProperties;
}

// 段の表（各絵の T）の [from, to] をそのまま渡す形の anim。shift … 部品ごとに少しずつずらすとき、from と to の両方に足す数
export function animAt(
  name: string,
  [from, to]: readonly [number, number],
  vars: Record<string, string> = {},
  shift = 0,
): CSSProperties {
  return anim(name, from + shift, to + shift, vars);
}

// 名物の欄のカードの絵（svg）に付ける、動きの決まりの値（scenes.css の「名物の欄の決まり」）
// ・ink … 絵の線のいちばん下が、絵の場所の上から何割の所にあるか（完成の形で測り、線の太さの分だけ少し大きめ）。
//   スクロールの始まりを、この線のいちばん下が画面の下の端に入ったところにする
// ・time … スクロールで動かせないブラウザで、時間で動くときの長さの倍率（主役の動きが 1.4 秒ほど見えるように）
// ・len … 動きの数の長さ（4 〜 4 + len。付けないときは 56）
export function cardTiming({ ink, time, len }: { ink: number; time: number; len?: number }): CSSProperties {
  return { "--scene-ink": ink, "--scene-time": time, ...(len ? { "--scene-len": len } : {}) } as CSSProperties;
}

// 時間で揺れ続ける動き（class の "scene-sway" と一緒に付ける）。長さと、ずらす時間（秒）
export function sway(duration: number, delay: number): CSSProperties {
  return { "--sway-dur": `${duration}s`, "--sway-delay": `${delay}s` } as CSSProperties;
}

// ごつごつ・こんもりした閉じた形の点（からあげ・肉みそなど）。
// 角度ごとに、決まった数式で半径を少し出し入れする（bumps … 出っぱりの数、bumpAmp … 出入りの大きさの割合）。
// 輪の書き始めと書き終わりを少し重ねるので、線（smooth）はそのまま筆で描いた輪になる。
// 塗り（polygon）に使うときは、重ねた分も含めてそのまま渡してよい
export function blobPts(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  seed: number,
  bumps = 7,
  bumpAmp = 0.08,
  steps = 28,
): P[] {
  const pts: P[] = [];
  const over = 0.12; // 重ねる分（ラジアン）
  for (let i = 0; i <= steps; i++) {
    const t = -over + ((PI * 2 + over * 2) * i) / steps;
    const w = 1 + bumpAmp * Math.sin(bumps * t + seed * 0.37) + jitter(seed + (i % steps)) * bumpAmp * 0.45;
    pts.push([cx + rx * w * Math.cos(t), cy + ry * w * Math.sin(t)]);
  }
  return pts;
}

// 横長の、角の丸い長方形のお皿のまわりの点（肉みそ冷奴と串焼きのお皿）。
// 床の面（u … 長い向き、v … 短い向き。半分の長さ hl・半分の幅 hw・角の丸み r、高さ z）で作り、
// 絵ごとの見る角度 pr で絵の座標にする。書き始めと書き終わりを少し重ねて、筆で描いた輪にする。
// ふちが少し立ったお皿は、外のふち（z = 0）と、ひと回り小さく少し低い内の底のふち（hl − 13・hw − 12・r − 8、z = −3）の2本で描く
export function roundRectPts(
  pr: (u: number, v: number, z?: number) => P,
  hl: number,
  hw: number,
  r: number,
  z: number,
  seed: number,
  amp: number,
): P[] {
  const ground: [number, number][] = [];
  const corners: [number, number, number][] = [
    [hl - r, hw - r, 0], // 右手前
    [-(hl - r), hw - r, PI / 2], // 左手前
    [-(hl - r), -(hw - r), PI], // 左奥
    [hl - r, -(hw - r), PI * 1.5], // 右奥
  ];
  corners.forEach(([cx, cy, t0], k) => {
    for (let i = 0; i <= 4; i++) {
      const t = t0 + (PI / 2) * (i / 4);
      ground.push([cx + r * Math.cos(t), cy + r * Math.sin(t)]);
    }
    // 次の角までの辺のまん中に1点（辺がふくらまないように）
    const [nx, ny, nt] = corners[(k + 1) % 4];
    const a: [number, number] = [cx + r * Math.cos(t0 + PI / 2), cy + r * Math.sin(t0 + PI / 2)];
    const b: [number, number] = [nx + r * Math.cos(nt), ny + r * Math.sin(nt)];
    ground.push([(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]);
  });
  // 重ね：最初の2点をもう一度
  ground.push(ground[0], ground[1]);
  return ground.map(([u, v], i) => {
    const [x, y] = pr(u, v, z);
    return [x + jitter(seed + i) * amp, y + jitter(seed + i + 50) * amp * 0.6] as const;
  });
}
