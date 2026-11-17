import { jitter, smooth, type P } from "./draw";
import "./scenes.css";

// ─── カードのふち（筆ペンで描いた四角い枠） ───
// 名物の欄のカード（Specialties.tsx）と、店舗情報のページ（app/info/page.tsx）の囲みで使う。
// 置き方：親を relative にして、いちばん初めの子として置く（absolute inset-0 で親いっぱいに広がる）。
// viewBox は 0〜100 の正方形で描き、カードの大きさに合わせて伸ばす（preserveAspectRatio="none"）。
// 線の太さは伸ばしても変わらないよう vector-effect: non-scaling-stroke（scenes.css の .scene-card-frame）。
// 辺はわずかに揺らした点をなめらかな線でつなぎ、角は小さな曲線（Q）で、ほんの少しだけ丸める。
// seed を変えると揺らぎ方が変わる（乱数なし。同じ seed なら毎回同じ線）。
function framePath(seed: number): string {
  const a = 0.6; // 枠の内側へのあき（線が切れないように）
  const b = 100 - a;
  const c = 1.1; // 角の丸み（角から両側へ、この分だけ手前で曲がり始める）
  const amp = 0.28;
  const side = (x0: number, y0: number, x1: number, y1: number, s: number): string => {
    const pts: P[] = [];
    const n = 5;
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const edge = i === 0 || i === n ? 0 : 1;
      pts.push([x0 + (x1 - x0) * t + jitter(s + i) * amp * edge, y0 + (y1 - y0) * t + jitter(s + i + 20) * amp * edge]);
    }
    // smooth() の書き出し（M x y）を外し、曲線の部分だけをつなぐ
    return smooth(pts).replace(/^M[^C]*/, "");
  };
  return [
    `M${a + c} ${a}`,
    side(a + c, a, b - c, a, seed), // 上
    `Q${b} ${a} ${b} ${a + c}`,
    side(b, a + c, b, b - c, seed + 40), // 右
    `Q${b} ${b} ${b - c} ${b}`,
    side(b - c, b, a + c, b, seed + 80), // 下
    `Q${a} ${b} ${a} ${b - c}`,
    side(a, b - c, a, a + c, seed + 120), // 左
    `Q${a} ${a} ${a + c} ${a}`,
    "Z",
  ].join(" ");
}

export default function CardFrame({ seed }: { seed: number }) {
  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
      className="pointer-events-none absolute inset-0 h-full w-full overflow-visible text-foreground"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={framePath(seed)} className="scene-card-frame" />
    </svg>
  );
}
