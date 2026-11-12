// ─── お店の入口（きたげんの店構え）の線画 ───
// トップの「結び」の場面で使う飾りの絵（aria-hidden。意味は横の文で伝える）。
// 本物のきたげんの店構えの骨組みと比率に合わせる（のぼり・貼り紙・花などの飾りは描かない）：
// ・横長の店構え（左右の柱の外どうしで 幅 360 × 高さ 226 ≒ 1.6：1）
// ・左右の端に細い柱（線2本）。いちばん上に柱の間いっぱいの白いひさしの帯（高さ 約 20%）、
//   その真ん中に帯より小さい白い看板（帯の幅の 約 43%・帯の高さの 約 80%。IZAKAYA ／ きたげん）
// ・ひさしのすぐ下に、柱の間いっぱいの横長の窓（欄間。高さ 約 12%。縦の桟は2本）
// ・欄間の下は、真ん中に木の枠のガラス戸1枚（幅 約 25%）、その左右は縦の板張りの壁
// ・戸の前にれんがの段、地面の線
// 線は1色（currentColor ＝ 呼び出し側の text-foreground）。端と角は丸く。
// 看板と札の文字は SVG の text（明朝体 700 ＝ font-serif font-bold。トップで読み込む Noto Serif JP）。色は線と同じ。
// 文字の幅は textLength で決めるので、明朝体が読み込めず代わりの字になっても、看板・札からはみ出さない。
// 塗り：ひさし・看板・札・すりガラスは scene-paper（場面の背景と同じ生成り色）で、後ろの線や明かりを隠す。
// 差し色は accent を1か所だけ（明かり：欄間と戸のガラスのうすい色。まとめて1か所）。
// 動き（スクロールの位置で進む。動きの名前と範囲は anim(...)、@keyframes は scenes.css）：
//   1) 柱・ひさし・壁・足もとの線が描かれる（4〜26）
//   2) 看板と戸が現れる（22〜34）
//   3) 欄間と戸のガラスに明かりがともる（32〜44）
//   4) 「営業中」の札が一度だけ小さく揺れて止まる（42〜52）
// 線の描き方の道具（揺らぎ・曲線）は draw.ts。乱数は使わないので、毎回同じ絵になる。

import { anim, line, type P } from "./draw";

// 四角（4本の少し揺れた線）
function rect(x0: number, y0: number, x1: number, y1: number, seed: number, amp = 0.6): string[] {
  const a: P = [x0, y0];
  const b: P = [x1, y0];
  const c: P = [x1, y1];
  const d: P = [x0, y1];
  return [line(a, b, seed, amp), line(b, c, seed + 10, amp), line(c, d, seed + 20, amp), line(d, a, seed + 30, amp)];
}

// ── 間取り（viewBox の座標） ──
const OUT_L = 20; // 左の柱の外
const IN_L = 27; // 左の柱の内（ここから右の柱の内までが「柱の間」）
const IN_R = 373;
const OUT_R = 380;
const TOP = 30; // ひさしの帯の上
const EAVE = 75; // ひさしの帯の下 ＝ 欄間の上（帯の高さ 45 ＝ 全体 226 の 約 20%）
const BEAM = 102; // 欄間の下（欄間の高さ 27 ＝ 約 12%）
const GROUND = 252; // 地面

// ── 戸（幅 90 ＝ 柱の外どうし 360 の 25%） ──
const DOOR_X0 = 155;
const DOOR_X1 = 245;
const DOOR_Y1 = 236; // 戸の下 ＝ れんがの段の上
const GLASS_X0 = 165;
const GLASS_X1 = 235;
const GLASS_Y0 = 112;
const GLASS_Y1 = 226;
const RAIL_A = [152, 156] as const; // 上の横の桟（ここから下がすりガラスの帯）
const RAIL_B = [178, 182] as const; // 下の横の桟

// ── 描かれる線（柱・ひさし・欄間・壁・足もと） ──
const DRAW_MAIN = [
  line([OUT_L, TOP - 4], [OUT_L + 0.5, GROUND], 4000, 0.6, 3), // 左の柱
  line([IN_L, TOP], [IN_L, GROUND], 4005, 0.5, 3),
  line([OUT_R, TOP - 4], [OUT_R - 0.5, GROUND], 4010, 0.6, 3), // 右の柱
  line([IN_R, TOP], [IN_R, GROUND], 4015, 0.5, 3),
  line([OUT_L - 4, TOP - 4], [OUT_R + 4, TOP - 4.5], 4020, 0.8, 4), // 柱の頭をつなぐ線
  line([IN_L, EAVE], [IN_R, EAVE - 0.5], 4025, 0.8, 4), // ひさしの帯の下
  line([IN_L, BEAM], [IN_R, BEAM], 4030, 0.8, 4), // 欄間の下
  line([6, GROUND], [394, GROUND - 0.5], 4035, 0.8, 4), // 地面
];
const DRAW_FINE = [
  line([IN_L, TOP], [IN_R, TOP], 4040, 0.6, 4), // ひさしの帯の上
  ...[DOOR_X0, DOOR_X1].map((x, i) => line([x, EAVE + 3], [x, BEAM - 3], 4045 + i * 3, 0.2, 1)), // 欄間の縦の桟（2本）
  // 板張りの壁（戸の左右に3本ずつ。間隔は 32）
  ...[59, 91, 123, 277, 309, 341].map((x, i) => line([x, BEAM + 4], [x, GROUND - 3], 4060 + i * 4, 0.4, 2)),
  // れんがの段（戸の前の横長の帯と、目地の短い線）
  line([145, DOOR_Y1], [255, DOOR_Y1], 4100, 0.4, 2),
  line([145, DOOR_Y1], [145, GROUND], 4103, 0.2, 1),
  line([255, DOOR_Y1], [255, GROUND], 4106, 0.2, 1),
  line([147, 244], [253, 244], 4109, 0.3, 2),
  ...[172, 200, 228].map((x, i) => line([x, DOOR_Y1 + 2], [x, 242], 4120 + i * 2, 0.1, 1)),
  ...[158, 186, 214, 242].map((x, i) => line([x, 246], [x, GROUND - 2], 4130 + i * 2, 0.1, 1)),
];

// ── 看板（ひさしの帯の真ん中。幅 150 ＝ 帯 346 の 約 43%、高さ 36 ＝ 帯 45 の 80%） ──
const SIGN_X0 = 125;
const SIGN_X1 = 275;
const SIGN_Y0 = 34.5;
const SIGN_Y1 = 70.5;
const SIGN = rect(SIGN_X0, SIGN_Y0, SIGN_X1, SIGN_Y1, 4200, 0.4);

// ── 戸（木の枠のガラス戸。ガラスは横の桟で3段：ガラス・すりガラスの帯・ガラス） ──
const DOOR = rect(DOOR_X0, BEAM, DOOR_X1, DOOR_Y1, 4300, 0.5);
const DOOR_FINE = [
  ...rect(GLASS_X0, GLASS_Y0, GLASS_X1, GLASS_Y1, 4340, 0.3), // ガラスの枠
  ...[...RAIL_A, ...RAIL_B].map((y, i) => line([GLASS_X0, y], [GLASS_X1, y], 4380 + i * 4, 0.2, 2)), // 横の桟
  line([GLASS_X0 + 8, 167], [GLASS_X1 - 8, 167], 4400, 0.2, 2), // すりガラスの帯の中の細い線
  line([240, 156], [240, 186], 4405, 0.2, 1), // 取っ手
];

// ── 「営業中」の札（戸の上のほうに下がる） ──
const NAIL: P = [200, 116];
const PLAQUE_X0 = 182;
const PLAQUE_X1 = 218;
const PLAQUE_Y0 = 125;
const PLAQUE_Y1 = 141;
const PLAQUE = [
  line(NAIL, [PLAQUE_X0 + 3, PLAQUE_Y0], 4450, 0.2, 1), // 吊るひも
  line(NAIL, [PLAQUE_X1 - 3, PLAQUE_Y0], 4455, 0.2, 1),
  ...rect(PLAQUE_X0, PLAQUE_Y0, PLAQUE_X1, PLAQUE_Y1, 4460, 0.3),
];

// ── 明かり（差し色。欄間と戸のガラス） ──
const LIGHT: readonly [number, number, number, number][] = [
  [IN_L + 1, EAVE + 1, IN_R - 1, BEAM - 1],
  [GLASS_X0 + 1, GLASS_Y0 + 1, GLASS_X1 - 1, GLASS_Y1 - 1],
];

const paths = (ds: readonly string[], className: string) => ds.map((d, i) => <path key={i} d={d} className={className} />);

export default function EntranceIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 18 400 242"
      aria-hidden="true"
      focusable="false"
      className={`scene-svg ${className}`}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* 差し色（accent）はここだけ：欄間と戸のガラスの明かり（線の後ろ） */}
      <g className="entrance-light scene-anim" style={anim("scene-on", 32, 44)}>
        {LIGHT.map(([x0, y0, x1, y1], i) => (
          <rect
            key={i}
            x={x0}
            y={y0}
            width={x1 - x0}
            height={y1 - y0}
            className="scene-accent-fill"
            fillOpacity={0.2}
            stroke="none"
          />
        ))}
      </g>

      {/* 柱・ひさし・欄間・壁・足もとの線（描かれる） */}
      <g className="entrance-frame">
        {/* ひさしの白い帯の塗り（柱の間いっぱい） */}
        <rect x={IN_L} y={TOP} width={IN_R - IN_L} height={EAVE - TOP} className="scene-paper" stroke="none" />
        {DRAW_MAIN.map((d, i) => (
          <path
            key={i}
            d={d}
            pathLength={1}
            className="scene-line scene-stroke-draw scene-anim"
            style={anim("scene-draw", 4 + i * 1.5, 14 + i * 1.5)}
          />
        ))}
        {DRAW_FINE.map((d, i) => (
          <path
            key={i}
            d={d}
            pathLength={1}
            className="scene-fine scene-stroke-draw scene-anim"
            style={anim("scene-draw", 10 + (i % 6) * 1.5, 18 + (i % 6) * 1.5)}
          />
        ))}
      </g>

      {/* 看板（ひさしの帯の真ん中） */}
      <g className="entrance-sign scene-anim" style={anim("scene-fade-up", 22, 32, { "--dy": "-8px" })}>
        <rect
          x={SIGN_X0}
          y={SIGN_Y0}
          width={SIGN_X1 - SIGN_X0}
          height={SIGN_Y1 - SIGN_Y0}
          className="scene-paper"
          stroke="none"
        />
        {paths(SIGN, "scene-line")}
        <g className="font-serif font-bold" fill="currentColor" stroke="none">
          <text x={SIGN_X0 + 7} y={SIGN_Y0 + 8} fontSize={6.5} textLength={30} lengthAdjust="spacingAndGlyphs">
            IZAKAYA
          </text>
          {/* 幅 105 ＝ 看板 150 の 70% */}
          <text x={200} y={SIGN_Y1 - 5} fontSize={23} textAnchor="middle" textLength={105} lengthAdjust="spacingAndGlyphs">
            きたげん
          </text>
        </g>
      </g>

      {/* 入口の戸（すりガラスの帯と「営業中」の札） */}
      <g className="entrance-door scene-anim" style={anim("scene-fade-up", 24, 34, { "--dy": "8px" })}>
        <rect
          x={GLASS_X0}
          y={RAIL_A[1]}
          width={GLASS_X1 - GLASS_X0}
          height={RAIL_B[0] - RAIL_A[1]}
          className="scene-paper"
          fillOpacity={0.6}
          stroke="none"
        />
        {paths(DOOR, "scene-line")}
        {paths(DOOR_FINE, "scene-fine")}
        <g className="entrance-plaque scene-anim" style={anim("entrance-swing", 42, 52, { "--o": "50% 0%" })}>
          <rect
            x={PLAQUE_X0}
            y={PLAQUE_Y0}
            width={PLAQUE_X1 - PLAQUE_X0}
            height={PLAQUE_Y1 - PLAQUE_Y0}
            className="scene-paper"
            stroke="none"
          />
          {paths(PLAQUE, "scene-fine")}
          <text
            x={200}
            y={PLAQUE_Y1 - 4}
            fontSize={11}
            textAnchor="middle"
            textLength={30}
            lengthAdjust="spacingAndGlyphs"
            className="font-serif font-bold"
            fill="currentColor"
            stroke="none"
          >
            営業中
          </text>
        </g>
      </g>
    </svg>
  );
}
