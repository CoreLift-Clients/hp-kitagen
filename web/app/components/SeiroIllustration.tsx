// ─── せいろ（自家製しゅうまい）の線画 ───
// トップの「せいろ」の場面で使う飾りの絵（aria-hidden。意味は横の文で伝える）。
// ・線は1色（currentColor ＝ 呼び出し側の text-foreground）。端と角は丸く。塗りは基本なし
// ・差し色は accent を1か所だけ（まん中のしゅうまいの上の、にんじんのような点）
// ・ふたにだけ、後ろの線を隠すための塗り（欄の背景と同じ色。--seiro-paper）を付ける
// ・部品ごとに g でまとめる：本体（seiro-body）・しゅうまい（seiro-shumai）・湯気（seiro-steam）・ふた（seiro-lid）。
//   重なりの順もこのとおり（湯気はふたの後ろ）。
//   動きは globals.css の「せいろの場面」に書く
// ・線の太さは globals.css の .seiro-line / .seiro-fine（スマホでは絵が縮む分だけ太くする）
//
// 筆ペンらしい揺らぎは、決まった数式でわずかにずらした点を、なめらかな曲線でつないで出す
// （乱数は使わないので、毎回同じ絵になる）。このファイルはサーバーで描くだけ（ブラウザでは計算しない）。

type P = readonly [number, number];

const r1 = (n: number) => Math.round(n * 10) / 10;

// -1〜1 の決まった揺らぎ
function jitter(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return (x - Math.floor(x)) * 2 - 1;
}

// 点をなめらかな曲線でつなぐ（Catmull-Rom → 3次ベジェ）
function smooth(pts: readonly P[]): string {
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

// だ円の一部（角度 t0→t1、ラジアン。y は下向きなので 0〜π が手前、π〜2π が奥）
function arcPts(
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

const arc = (...a: Parameters<typeof arcPts>) => smooth(arcPts(...a));

// 1周（書き始めと書き終わりを少し重ねて、筆で描いた輪のようにする）
const ring = (cx: number, cy: number, rx: number, ry: number, seed: number, amp = 1.2) =>
  arc(cx, cy, rx, ry, Math.PI * 0.96, Math.PI * 3.02, 24, amp, seed);

// 少し揺れた線（2点の間に揺らぎのある点を入れる）
function line(a: P, b: P, seed: number, amp = 0.9, mid = 2): string {
  const pts: P[] = [a];
  for (let i = 1; i <= mid; i++) {
    const t = i / (mid + 1);
    pts.push([a[0] + (b[0] - a[0]) * t + jitter(seed + i) * amp, a[1] + (b[1] - a[1]) * t + jitter(seed + i + 9) * amp]);
  }
  pts.push(b);
  return smooth(pts);
}

const PI = Math.PI;

// ── 本体（竹のせいろの胴） ──
const BODY = [
  ring(200, 230, 150, 34, 1), // 上のふち（外）
  arc(200, 232, 139, 26, PI * 1.02, PI * 1.98, 14, 0.8, 40), // 上のふち（内側・奥）
  line([50, 231], [52.5, 321], 60), // 左の側面
  line([350, 231], [347.5, 321], 70), // 右の側面
  arc(200, 320, 148, 32, PI * -0.01, PI * 1.01, 16, 1, 80), // 下のふち（手前）
];
// 胴に巻いた竹の帯（2本）と、帯をとめる縦の綴じ目
const BODY_FINE = [
  arc(200, 262, 150, 34, PI * 0.02, PI * 0.98, 16, 0.9, 100),
  arc(200, 271, 150, 34, PI * 0.03, PI * 0.97, 16, 0.9, 120),
  ...[0.18, 0.34, 0.5, 0.66, 0.82].map((u, i) => {
    const t = PI * (1 - u);
    const x = 200 + 150 * Math.cos(t);
    const y = 262 + 34 * Math.sin(t);
    return line([x, y + 1], [x + jitter(140 + i) * 1.5, y + 8], 150 + i * 3, 0.3, 1);
  }),
];

// ── しゅうまい（3個）。上の口のひだ・中の具・胴・ひだの筋 ──
const SHUMAI_AT: readonly P[] = [
  [133, 219],
  [200, 223],
  [267, 219],
];
const SHUMAI = SHUMAI_AT.flatMap(([cx, ty], i) => {
  const s = 200 + i * 40;
  return [
    // 口のひだ（波打つ輪）
    smooth(arcPts(cx, ty, 18.5, 5.8, PI * 0.95, PI * 3.03, 40, 0.4, s, { k: 9, a: 0.14 })),
    // 中の具（奥側の小さな弧）
    arc(cx, ty + 0.5, 9, 2.6, PI * 1.12, PI * 1.88, 6, 0.3, s + 50),
    // 胴の左右（ふちの手前で切れる）
    smooth([
      [cx - 18, ty + 3],
      [cx - 24 + jitter(s + 61), ty + 14],
      [cx - 26, ty + 27],
      [cx - 25 + jitter(s + 62), ty + 38],
    ]),
    smooth([
      [cx + 18, ty + 3],
      [cx + 24 + jitter(s + 63), ty + 14],
      [cx + 26, ty + 27],
      [cx + 25 + jitter(s + 64), ty + 38],
    ]),
  ];
});
const SHUMAI_FINE = SHUMAI_AT.flatMap(([cx, ty], i) => {
  const s = 400 + i * 20;
  return [
    line([cx - 9, ty + 6], [cx - 12, ty + 22], s, 0.6, 1),
    line([cx + 1, ty + 7], [cx + 1.5, ty + 24], s + 5, 0.6, 1),
    line([cx + 10, ty + 6], [cx + 13, ty + 21], s + 10, 0.6, 1),
  ];
});

// ── ふた ──
// 塗り（後ろの線を隠す）：上面の奥の弧 → 右の側面 → 手前の下の弧 → 左の側面
const LID_FILL = (() => {
  const top = arcPts(200, 200, 153, 34, PI, PI * 2, 24, 0, 0);
  const bottom = arcPts(200, 226, 153, 34, 0, PI, 24, 0, 0);
  return `M${[...top, ...bottom].map(([x, y]) => `${r1(x)} ${r1(y)}`).join(" L")} Z`;
})();
const LID = [
  ring(200, 200, 153, 34, 500), // 上面のふち
  line([47, 201], [47.5, 227], 540, 0.5, 1), // 左の側面
  line([353, 201], [352.5, 227], 550, 0.5, 1), // 右の側面
  arc(200, 226, 153, 34, PI * -0.01, PI * 1.01, 16, 1, 560), // 下のふち（手前）
];
// 上面の内側の枠と、編み目（横の筋）
const LID_FINE = [
  ring(200, 200, 138, 28, 600, 0.9),
  // 編み目は、ところどころ途切れる短い筋にする（まっすぐな線が並ぶと網のように見えるため）
  ...[-15, -5, 5, 14].flatMap((dy, i) => {
    const y = 200 + dy;
    const half = 138 * Math.sqrt(1 - (dy / 28) ** 2) - 14;
    const cut = 200 + jitter(610 + i) * 40;
    const x0 = 200 - half + Math.abs(jitter(615 + i)) * 12;
    const x1 = 200 + half - Math.abs(jitter(618 + i)) * 12;
    return [
      line([x0, y + jitter(620 + i) * 1.5], [cut - 9, y + jitter(625 + i) * 1.5], 630 + i * 7, 1.4, 3),
      line([cut + 9, y + jitter(640 + i) * 1.5], [x1, y + jitter(645 + i) * 1.5], 650 + i * 7, 1.4, 3),
    ];
  }),
];

// ── 湯気（4本）。下から上へ描くので、点は下から並べる ──
function steam(x0: number, yStart: number, yEnd: number, phase: number, amp: number, seed: number): string {
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
const STEAM = [
  steam(140, 206, 6, 0.2, 10, 700),
  steam(184, 212, -30, 2.1, 12, 720),
  steam(224, 210, -12, 4.0, 11, 740),
  steam(262, 205, 22, 1.0, 9, 760),
];

export default function SeiroIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 -40 400 412"
      aria-hidden="true"
      focusable="false"
      className={`seiro-svg ${className}`}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <defs>
        {/* 湯気は上のほうで薄くなる（線の色は同じ foreground のまま、濃さだけ変える） */}
        <linearGradient id="seiro-steam-fade" gradientUnits="userSpaceOnUse" x1="0" y1="214" x2="0" y2="-34">
          <stop offset="0" stopColor="currentColor" stopOpacity="0.95" />
          <stop offset="0.55" stopColor="currentColor" stopOpacity="0.8" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>

      <g className="seiro-body">
        {BODY.map((d, i) => (
          <path key={i} d={d} className="seiro-line" />
        ))}
        {BODY_FINE.map((d, i) => (
          <path key={i} d={d} className="seiro-fine" />
        ))}
      </g>

      <g className="seiro-shumai">
        {SHUMAI.map((d, i) => (
          <path key={i} d={d} className="seiro-line" />
        ))}
        {SHUMAI_FINE.map((d, i) => (
          <path key={i} d={d} className="seiro-fine" />
        ))}
        {/* 差し色（accent）はここだけ */}
        <circle cx="200" cy="222.5" r="3.6" className="seiro-accent" stroke="none" />
      </g>

      {/* 湯気はふたの後ろ（ふたとふちのすき間から出て、ふたの上に立ちのぼるように見せる） */}
      <g className="seiro-steam" stroke="url(#seiro-steam-fade)">
        {STEAM.map((d, i) => (
          <g key={i} className={`seiro-sway seiro-sway-${i + 1}`}>
            <path d={d} pathLength={1} className={`seiro-line seiro-steam-line seiro-steam-${i + 1}`} />
          </g>
        ))}
      </g>
      <g className="seiro-lid">
        <path d={LID_FILL} className="seiro-lid-fill" stroke="none" />
        {LID.map((d, i) => (
          <path key={i} d={d} className="seiro-line" />
        ))}
        {LID_FINE.map((d, i) => (
          <path key={i} d={d} className="seiro-fine" />
        ))}
      </g>
    </svg>
  );
}
