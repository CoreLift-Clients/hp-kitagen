// ─── お店の入口（きたげんの正面）の線画 ───
// トップの「結び」の場面で使う飾りの絵（aria-hidden。意味は横の文で伝える）。
// 本物のきたげんの入口に似せる：上に横長の白い看板（IZAKAYA ／ きたげん）、その下に入口の幅いっぱいの横長の窓（欄間）、
// 左右は縦の板張りの木の壁、真ん中に木の枠のガラス戸（すりガラスの帯と「営業中」の札）、右の壁に掲示ケース、
// 入口の前の左寄りに黒板の立て看板、足もとに段。
// ・線は1色（currentColor ＝ 呼び出し側の text-foreground）。端と角は丸く
// ・看板と札の文字は SVG の text（明朝体 700 ＝ font-serif font-bold。トップで読み込む Noto Serif JP）。色は線と同じ。
//   文字の幅は textLength で決めるので、明朝体が読み込めず代わりの字になっても、看板・札からはみ出さない
// ・塗り：看板・札・掲示ケース・黒板は scene-paper（場面の背景と同じ生成り色）で、後ろの線を隠す
// ・差し色は accent を1か所だけ（明かり：欄間のガラスと戸のガラスのうすい色。まとめて1か所）
// ・動き（スクロールの位置で進む。動きの名前と範囲は anim(...)、@keyframes は scenes.css）：
//   1) 壁の線が描かれ、看板・欄間・板張り・戸・掲示ケースが現れる（4〜30）
//   2) 欄間と戸のガラスに明かりがともる（30〜42）
//   3) 「営業中」の札が一度だけ小さく揺れて止まる（40〜50）
//   4) 黒板の立て看板が現れる（46〜58）
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
const L = 40; // 入口の左の端
const R = 360; // 入口の右の端
const SIGN_Y0 = 30; // 看板
const SIGN_Y1 = 92;
const WIN_Y0 = 98; // 欄間（横長の窓）
const WIN_Y1 = 124;
const BEAM = 130; // 欄間の下の横木（ここから下が壁と戸）
const FLOOR = 338; // 入口の床（段の上の面）
const GROUND = 350; // 地面

// ── 壁の大きな線（描かれる） ──
const WALL_DRAW = [
  line([L, SIGN_Y1], [L + 0.5, FLOOR], 4000, 0.8, 3), // 左の端
  line([R, SIGN_Y1], [R - 0.5, FLOOR], 4010, 0.8, 3), // 右の端
  line([L, BEAM], [R, BEAM - 0.5], 4020, 0.8, 4), // 欄間の下の横木
  line([L - 6, FLOOR], [R + 6, FLOOR - 0.5], 4030, 0.8, 4), // 段の上
  line([L - 18, GROUND], [R + 18, GROUND], 4040, 0.8, 4), // 地面
];

// ── 板張りの壁の縦の線と、段のタイルの目地（細い線。現れる） ──
const BOARDS = [
  ...[60, 80, 100, 120].map((x, i) => line([x, BEAM + 3], [x, FLOOR - 2], 4100 + i * 4, 0.3, 2)), // 左の壁
  ...[262, 282, 302, 322, 342].map((x, i) => line([x, BEAM + 3], [x, FLOOR - 2], 4130 + i * 4, 0.3, 2)), // 右の壁
];
const STEP_JOINTS = [130, 180, 230, 280, 330].map((x, i) => line([x, FLOOR + 2], [x - 1, GROUND - 2], 4160 + i * 3, 0.2, 1));

// ── 看板（文字は text） ──
const SIGN = rect(L, SIGN_Y0, R, SIGN_Y1, 4200, 0.7);

// ── 欄間（横長の窓） ──
const TRANSOM = [
  ...rect(L + 4, WIN_Y0, R - 4, WIN_Y1, 4240, 0.5),
  ...[120, 200, 280].map((x, i) => line([x, WIN_Y0 + 2], [x, WIN_Y1 - 2], 4280 + i * 3, 0.2, 1)),
];

// ── 入口の戸（木の枠のガラス戸） ──
const DOOR_X0 = 146;
const DOOR_X1 = 234;
const GLASS_X0 = 156;
const GLASS_X1 = 224;
const GLASS_Y0 = 148;
const GLASS_Y1 = 324;
const FROST_Y0 = 224; // すりガラスの帯
const FROST_Y1 = 246;
const DOOR = [
  line([138, BEAM], [138.5, FLOOR], 4300, 0.6, 3), // 戸の枠の左
  line([242, BEAM], [241.5, FLOOR], 4305, 0.6, 3), // 戸の枠の右
  ...rect(DOOR_X0, BEAM + 6, DOOR_X1, FLOOR - 2, 4310, 0.5), // 戸
];
const DOOR_FINE = [
  ...rect(GLASS_X0, GLASS_Y0, GLASS_X1, GLASS_Y1, 4350, 0.4), // ガラス
  line([GLASS_X0, FROST_Y0], [GLASS_X1, FROST_Y0], 4390, 0.3, 2), // すりガラスの帯の上下
  line([GLASS_X0, FROST_Y1], [GLASS_X1, FROST_Y1], 4395, 0.3, 2),
  line([GLASS_X0 + 6, 232], [GLASS_X1 - 6, 232], 4400, 0.2, 2), // 帯の中の細い横線
  line([GLASS_X0 + 6, 238], [GLASS_X1 - 6, 238], 4405, 0.2, 2),
  line([229, 214], [229, 256], 4410, 0.2, 1), // 取っ手
];

// ── 「営業中」の札（戸の上のほうに下がる） ──
const NAIL: P = [190, 152];
const PLAQUE_X0 = 168;
const PLAQUE_X1 = 212;
const PLAQUE_Y0 = 166;
const PLAQUE_Y1 = 186;
const PLAQUE = [
  line(NAIL, [PLAQUE_X0 + 4, PLAQUE_Y0], 4450, 0.2, 1), // 吊るひも
  line(NAIL, [PLAQUE_X1 - 4, PLAQUE_Y0], 4455, 0.2, 1),
  ...rect(PLAQUE_X0, PLAQUE_Y0, PLAQUE_X1, PLAQUE_Y1, 4460, 0.3),
];

// ── 右の壁の掲示ケース（中に紙が2枚） ──
const BOARD_X0 = 268;
const BOARD_X1 = 336;
const BOARD_Y0 = 178;
const BOARD_Y1 = 246;
const NOTICE = rect(BOARD_X0, BOARD_Y0, BOARD_X1, BOARD_Y1, 4500, 0.5);
const NOTICE_FINE = [...rect(276, 188, 299, 234, 4540, 0.3), ...rect(306, 192, 328, 226, 4580, 0.3)];

// ── 黒板の立て看板（A型。黒板は線の枠だけ） ──
const EASEL = [
  line([67, 262], [109, 262], 4600, 0.4, 2), // 上
  line([67, 262], [60, GROUND], 4605, 0.5, 3), // 左の脚
  line([109, 262], [116, GROUND], 4610, 0.5, 3), // 右の脚
  line([62, 332], [114, 332], 4615, 0.4, 2), // 下の横木
];
const BOARD_PTS: readonly P[] = [
  [71, 270],
  [105, 270],
  [108, 322],
  [68, 322],
];
const EASEL_FINE = [
  ...BOARD_PTS.map((p, i) => line(p, BOARD_PTS[(i + 1) % 4], 4620 + i * 5, 0.3, 1)), // 黒板の枠
  line([77, 284], [99, 284], 4650, 0.4, 2), // 黒板の中の線（文字は書かない）
  line([77, 296], [95, 296], 4655, 0.4, 2),
  line([78, 308], [100, 308], 4660, 0.4, 2),
];

// ── 明かり（差し色。欄間と戸のガラス） ──
const LIGHT: readonly [number, number, number, number][] = [
  [L + 5, WIN_Y0 + 1, R - 5, WIN_Y1 - 1],
  [GLASS_X0 + 1, GLASS_Y0 + 1, GLASS_X1 - 1, GLASS_Y1 - 1],
];

const paths = (ds: readonly string[], className: string) => ds.map((d, i) => <path key={i} d={d} className={className} />);

export default function EntranceIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 20 400 340"
      aria-hidden="true"
      focusable="false"
      className={`scene-svg ${className}`}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* 差し色（accent）はここだけ：欄間と戸のガラスの明かり（線の後ろ） */}
      <g className="entrance-light scene-anim" style={anim("scene-on", 30, 42)}>
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

      {/* 壁の大きな線（描かれる） */}
      <g className="entrance-wall">
        {WALL_DRAW.map((d, i) => (
          <path
            key={i}
            d={d}
            pathLength={1}
            className="scene-line scene-stroke-draw scene-anim"
            style={anim("scene-draw", 4 + i * 2, 16 + i * 2)}
          />
        ))}
      </g>

      {/* 板張りの壁と段の目地 */}
      <g className="entrance-boards scene-anim" style={anim("scene-on", 12, 24)}>
        {paths(BOARDS, "scene-fine")}
        {paths(STEP_JOINTS, "scene-fine")}
      </g>

      {/* 看板と欄間 */}
      <g className="entrance-sign scene-anim" style={anim("scene-fade-up", 8, 22, { "--dy": "-10px" })}>
        <rect x={L} y={SIGN_Y0} width={R - L} height={SIGN_Y1 - SIGN_Y0} className="scene-paper" stroke="none" />
        {paths(SIGN, "scene-line")}
        <g className="font-serif font-bold" fill="currentColor" stroke="none">
          <text x={L + 12} y={SIGN_Y0 + 16} fontSize={10} textLength={56} lengthAdjust="spacingAndGlyphs">
            IZAKAYA
          </text>
          <text x={200} y={SIGN_Y0 + 46} fontSize={38} textAnchor="middle" textLength={164} lengthAdjust="spacingAndGlyphs">
            きたげん
          </text>
        </g>
        {paths(TRANSOM, "scene-fine")}
      </g>

      {/* 入口の戸（すりガラスの帯と「営業中」の札） */}
      <g className="entrance-door scene-anim" style={anim("scene-fade-up", 14, 28, { "--dy": "10px" })}>
        {paths(DOOR, "scene-line")}
        <rect
          x={GLASS_X0}
          y={FROST_Y0}
          width={GLASS_X1 - GLASS_X0}
          height={FROST_Y1 - FROST_Y0}
          className="scene-paper"
          fillOpacity={0.6}
          stroke="none"
        />
        {paths(DOOR_FINE, "scene-fine")}
        <g className="entrance-plaque scene-anim" style={anim("entrance-swing", 40, 50, { "--o": "50% 0%" })}>
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
            x={190}
            y={PLAQUE_Y1 - 5}
            fontSize={13}
            textAnchor="middle"
            textLength={36}
            lengthAdjust="spacingAndGlyphs"
            className="font-serif font-bold"
            fill="currentColor"
            stroke="none"
          >
            営業中
          </text>
        </g>
      </g>

      {/* 右の壁の掲示ケース */}
      <g className="entrance-notice scene-anim" style={anim("scene-fade-up", 20, 30, { "--dy": "8px" })}>
        <rect
          x={BOARD_X0}
          y={BOARD_Y0}
          width={BOARD_X1 - BOARD_X0}
          height={BOARD_Y1 - BOARD_Y0}
          className="scene-paper"
          stroke="none"
        />
        {paths(NOTICE, "scene-line")}
        {paths(NOTICE_FINE, "scene-fine")}
      </g>

      {/* 黒板の立て看板（最後に現れる） */}
      <g className="entrance-easel scene-anim" style={anim("scene-fade-up", 46, 58, { "--dy": "12px" })}>
        <path
          d={`M${BOARD_PTS.map(([x, y]) => `${x} ${y}`).join(" L")} Z`}
          className="scene-paper"
          stroke="none"
        />
        {paths(EASEL, "scene-line")}
        {paths(EASEL_FINE, "scene-fine")}
      </g>
    </svg>
  );
}
