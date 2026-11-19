// ─── 注がれる流れ（飲み物の絵で使い回す部品） ───
// 生ビール（BeerIllustration.tsx）の「注いでいる」流れの描き方を、日本酒・焼酎の絵（SakeIllustration.tsx）でも使えるように部品にしたもの。
// ・流れは、水彩の帯（輪郭は左右の細い線 .scene-fine。上は注ぎ口、下は飲み物の中へ入るので、どちらも閉じない）。
//   下へ行くほど少し細く（w0 → w1）、ほんの少しよじれて揺らぐ（乱数なし。毎回同じ形）
// ・帯の中に、白をうすくした明るい筋を1〜2本入れ、時間でずっと上から下へ流す（scenes.css の .pour-flow。画面の外では止まる。
//   prefers-reduced-motion のときは、破線のまま止まって見える）。
//   破線の長さと流れる速さは、流れの長さによらずそろう（pathLength を、流れの長さ ÷ FLOW_UNIT にする）
// ・流れの通り道は、2次ベジェ曲線（from → ctrl → to）。まっすぐ落ちる流れは ctrl を from と to の間に置く
// ・帯の細さのための線の太さの例外は scenes.css の .pour（小さい絵でも輪郭の線が帯を埋めないように）
// ・動き：上から下へ伸びる（scenes.css の pour-grow。上の端を支点に縦に伸びる）
// ・cut を渡すと、注ぎ終わりに流れが上から切れて、下へ吸い込まれるように縮んで消える（scenes.css の pour-cut。
//   日本酒・焼酎の流れと同じ消え方）。明るい筋は、切れ始めにすっと消える（流れが止まって見えるように）。
//   動き終わり（prefers-reduced-motion のときも）は、流れも筋も見えない（.pour-gone）

import type { CSSProperties } from "react";
import { PI, anim, polygon, smooth, type P } from "./draw";
import { Wash } from "./Wash";

export type PourPath = {
  from: P; // 注ぎ口のすぐ下（流れの上の端）
  ctrl: P; // 曲がり具合
  to: P; // 飲み物に入る所（流れの下の端）
  w0: number; // 上の端の幅
  w1: number; // 下の端の幅
  steps?: number; // 点の数（長い流れは多めに）
};

// 筋の破線の長さの基準（生ビールの筋の長さ。この長さで pathLength がちょうど 1 になる）
const FLOW_UNIT = 41.6;

const len = (pts: readonly P[]) => pts.reduce((s, p, i) => (i ? s + Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]) : 0), 0);

export function pourShape({ from, ctrl, to, w0, w1, steps = 8 }: PourPath) {
  const L: P[] = [];
  const R: P[] = [];
  const C: P[] = [];
  const N: P[] = []; // 各点の、流れに直角な向き（右向き）
  const T: P[] = []; // 各点の、流れの向き
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const u = 1 - t;
    const x = u * u * from[0] + 2 * u * t * ctrl[0] + t * t * to[0];
    const y = u * u * from[1] + 2 * u * t * ctrl[1] + t * t * to[1];
    const tx0 = 2 * u * (ctrl[0] - from[0]) + 2 * t * (to[0] - ctrl[0]);
    const ty0 = 2 * u * (ctrl[1] - from[1]) + 2 * t * (to[1] - ctrl[1]);
    const tl = Math.hypot(tx0, ty0) || 1;
    const tx = tx0 / tl;
    const ty = ty0 / tl;
    const nx = ty;
    const ny = -tx;
    // 揺らぎ・幅・よじれ（生ビールの流れと同じ式）
    const sway = Math.sin(t * PI * 1.6 + 0.3) * 0.9 - 0.3;
    const w = w0 - (w0 - w1) * t + Math.sin(t * PI * 3.2) * 0.45;
    const twist = Math.sin(t * PI * 2.4) * 0.35;
    const at = (k: number): P => [x + nx * (sway + k), y + ny * (sway + k)];
    L.push(at(-w / 2 + twist));
    R.push(at(w / 2 + Math.sin(t * PI * 2.4 + 1.4) * 0.35));
    C.push(at(twist * 0.5));
    N.push([nx, ny]);
    T.push([tx, ty]);
  }
  // 明るい筋：中心から左右へ少しずらした2本（1本目は少し下へもずらす）
  const s1 = C.slice(0, -1).map(([x, y], i) => [x - N[i][0] * 1.2 + T[i][0] * 2, y - N[i][1] * 1.2 + T[i][1] * 2] as const);
  const s2 = C.slice(1).map(([x, y], j) => [x + N[j + 1][0] * 1.4, y + N[j + 1][1] * 1.4] as const);
  return {
    edges: [smooth(L), smooth(R)],
    fill: polygon([...L, ...[...R].reverse()]),
    streaks: [s1, s2].map((pts) => ({ d: smooth(pts), length: Math.round((len(pts) / FLOW_UNIT) * 100) / 100 })),
  };
}

// 流れ1本。shape は pourShape の結果。tone は水彩の色（.food-wash-*）、filter は絵のにじみのフィルタの id。
// streaks … 明るい筋の本数（1 か 2）。grow … 伸びる動きの範囲（anim の from・to）。
// cut … 注ぎ終わりに、流れが上から切れて消える範囲（anim の from・to。渡さないときは、流れは注いでいる形のまま残る）
export function Pour({
  shape,
  tone,
  filter,
  id,
  streaks = 2,
  grow,
  cut,
  className = "",
}: {
  shape: ReturnType<typeof pourShape>;
  tone: string;
  filter: string;
  id: string;
  streaks?: 1 | 2;
  grow: readonly [number, number];
  cut?: readonly [number, number];
  className?: string;
}) {
  const flow = shape.streaks
    .slice(0, streaks)
    .map((s, i) => <path key={i} d={s.d} pathLength={s.length} className={`pour-flow pour-flow-${i + 1}`} />);
  const body = (
    <g className={`pour scene-anim ${className}`} style={anim("pour-grow", grow[0], grow[1], { "--o": "50% 0%" }) as CSSProperties}>
      <Wash filter={filter} d={shape.fill} tone={tone} id={id} shift={[0.4, 0.3]} line={2.1} />
      {cut ? (
        // 明るい筋は、切れ始め（cut の最初の 4 割）ですっと消える
        <g className="scene-anim" style={anim("scene-fade-out", cut[0], cut[0] + (cut[1] - cut[0]) * 0.4)}>
          {flow}
        </g>
      ) : (
        flow
      )}
      {shape.edges.map((d, i) => (
        <path key={i} d={d} className="scene-fine" />
      ))}
    </g>
  );
  if (!cut) return body;
  // 注ぎ終わり：上から切れて、下の端を支点に縮んで消える
  return (
    <g className="pour-gone scene-anim" style={anim("pour-cut", cut[0], cut[1], { "--o": "50% 100%" }) as CSSProperties}>
      {body}
    </g>
  );
}
