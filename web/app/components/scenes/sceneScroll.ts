// ─── 場面の絵を、スクロールの位置に合わせて進める（scroll-driven animations が使えないブラウザの代わり） ───
// iOS 26 より前の Safari（iPhone の Chrome なども同じ WebKit）は animation-timeline: view() に対応していない。
// そのブラウザだけ、このプログラムで、scenes.css の「1) スクロールの位置で進める」と同じ決まりの進み具合を計算して当てる。
//
// ・使い分け（sceneMode）
//   css  … CSS.supports("animation-timeline: view()") が true。動きは CSS のまま。ここでは何もしない（?debug=1 の表示だけ）
//   js   … false で、Web Animations API（getAnimations）が使える。このプログラムで進める
//   time … それも使えない古いブラウザ。今までどおり、画面に入ったら時間で1回動く（ScenePlayOnView・scenes.css の data-scene="play"）
//   none … prefers-reduced-motion: reduce。何もしない（動き終わった絵のまま）
//
// ・進み具合の出し方（scenes.css の animation-range と同じ式）
//   見えている画面：上 T ＝ 固定ヘッダーの高さ（--header-h）、下 B ＝ visualViewport.height − 下の「電話する」の高さ（出ているときだけ）
//   絵（.scene-art）の上の端 y・高さ h（getBoundingClientRect）から、view() の contain 0% と 100% の位置を出す：
//     contain 0%   … y0 ＝ max(B − h, T)（絵が見えている画面に全部入ったところ。絵が大きいときは、絵の上の端が T）
//     contain 100% … y1 ＝ min(T, B − h)
//   範囲の始まり yS ＝ y0 ＋ lead、終わり yE ＝ y0 ＋ span × (y1 − y0)
//   場面の進み f ＝ (yS − y) ÷ (yS − yE)。4 〜 (4 ＋ len) の数に直すと rr ＝ f × len（＋4）
//   各部品は --r0・--r1 で、自分の受け持ち（max(0, r0 − 4) 〜 min(len, r1 − 4)）の中での割合を進み具合にする（段の配分は CSS と同じ）
//   span・lead・len は CSS と同じ値を使う：
//     len  … svg の --scene-len（付けていない絵は 56）
//     span … svg の --scene-span（席の絵 62%、背の低い画面の席 80%。付けていない絵は 50%）
//     lead … 名物の欄のカード（.scene-svg-card）は (1 − --scene-ink) × 絵の場所の幅。それ以外は svg の --scene-lead（付けていない絵は 0）
//
// ・当て方：data-scene="js" のとき、各部品の CSS の動きを「長さ 1000ms・一時停止」にしておき（scenes.css）、
//   element.getAnimations() で取った動きの currentTime を、進み具合 × 1000ms にする
//
// ・計算を減らす工夫
//   スクロール・画面の大きさの変化のたびには計算せず、requestAnimationFrame で1フレームに1回まとめる。
//   各部品の動き（getAnimations）と --r0・--r1 は、登録したときに1回だけ読む。
//   画面の大きさが変わったとき（アドレスバーの出し入れなど）は、画面の高さと範囲の値だけを読み直す。
//   計算するのは、画面の近く（上下に1画面分）にある絵だけ（IntersectionObserver）。遠ざかった絵は、最後に1回だけ計算して止める。
//   位置を読む（getBoundingClientRect）のを先にまとめ、そのあとで動きに書く。進み具合が変わらない部品には書かない
//
// ・?debug=1 のときだけ、画面の右上に小さな表示を出す（どちらの仕組みか・画面の真ん中にいちばん近い絵の名前と進み・画面の高さ）。
//   サーバーで作る HTML には出ないので、検索にも見た目にも影響しない

export type SceneMode = "css" | "js" | "time" | "none";

const DUR = 1000; // data-scene="js" のときの動きの長さ（scenes.css と同じ。ms）

type Part = { anim: Animation; a: number; b: number; last: number };
type Entry = {
  el: HTMLElement;
  name: string;
  parts: Part[];
  near: boolean;
  // 範囲の決まり（画面の大きさが変わったら読み直す）
  len: number;
  span: number;
  lead: number;
  // ?debug=1 の表示のため
  f: number;
  center: number;
  once: boolean; // 次のフレームで、近くになくても1回だけ計算する
};

let mode: SceneMode | null = null;
const entries = new Set<Entry>();
let io: IntersectionObserver | null = null;
let rafId = 0;
let listening = false;
let configDirty = false; // 画面の大きさが変わった（範囲の値を読み直す）
let debugEl: HTMLDivElement | null = null;
let debugOn: boolean | null = null;
// ?debug=1 の表示用：1フレームの計算の時間（ms。開いてからの最大と平均。準備のフレームは除く）
let costMax = 0;
let costSum = 0;
let costN = 0;
const costRecent: number[] = []; // 直近 300 フレーム（95% の値を出すため）

export function sceneMode(): SceneMode {
  if (mode) return mode;
  if (typeof window === "undefined") return "none";
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) mode = "none";
  else if (typeof CSS !== "undefined" && CSS.supports("animation-timeline: view()")) mode = "css";
  else if (
    "IntersectionObserver" in window &&
    typeof Element !== "undefined" &&
    typeof Element.prototype.getAnimations === "function"
  )
    mode = "js";
  else mode = "time";
  return mode;
}

function isDebug(): boolean {
  if (debugOn === null) {
    try {
      debugOn = new URLSearchParams(window.location.search).get("debug") === "1";
    } catch {
      debugOn = false;
    }
  }
  return debugOn;
}

// ─── 見えている画面 ───
function viewport() {
  const vvH = window.visualViewport?.height ?? window.innerHeight;
  const headerH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) || 0;
  // 下の「電話する」（MobileCallBar。md より狭い画面だけ出る）。高さは 52px ＋ safe-area
  const bar = document.querySelector<HTMLElement>("[data-call-bar]");
  // （固定配置なので offsetParent では出ているか分からない。md 以上は display: none で高さ 0）
  const barH = bar ? bar.getBoundingClientRect().height : 0;
  return { vvH, headerH, barH, T: headerH, B: vvH - barH };
}
let vp = { vvH: 0, headerH: 0, barH: 0, T: 0, B: 0 };

function num(s: string, fallback: number): number {
  const v = parseFloat(s);
  return Number.isFinite(v) ? v : fallback;
}

function readConfig(e: Entry) {
  const svg = e.el.querySelector<SVGSVGElement>(".scene-svg");
  const cs = svg ? getComputedStyle(svg) : null;
  e.len = cs ? num(cs.getPropertyValue("--scene-len"), 56) : 56;
  const span = cs ? cs.getPropertyValue("--scene-span").trim() : "";
  e.span = span.endsWith("%") ? num(span, 50) / 100 : 0.5;
  if (svg && svg.classList.contains("scene-svg-card")) {
    const ink = cs ? num(cs.getPropertyValue("--scene-ink"), 1) : 1;
    e.lead = (1 - ink) * e.el.clientWidth;
  } else {
    e.lead = cs ? num(cs.getPropertyValue("--scene-lead"), 0) : 0;
  }
}

function collectParts(e: Entry) {
  const parts: Part[] = [];
  const len = e.len;
  e.el.querySelectorAll<HTMLElement | SVGElement>(".scene-anim").forEach((p) => {
    const cs = getComputedStyle(p);
    const name = cs.getPropertyValue("--a").trim();
    const r0 = num(cs.getPropertyValue("--r0"), 4);
    const r1 = num(cs.getPropertyValue("--r1"), 60);
    const anim = p
      .getAnimations()
      .find((x) => (x as CSSAnimation).animationName === name || !("animationName" in x));
    if (!anim) return;
    anim.pause();
    parts.push({ anim, a: Math.max(0, r0 - 4), b: Math.min(len, r1 - 4), last: -1 });
  });
  e.parts = parts;
}

// 場面の進み f（範囲の始まりで 0、終わりで 1。範囲の外は 0 より小さい・1 より大きい）
function progressOf(e: Entry, rect: DOMRect): number {
  const { T, B } = vp;
  const y = rect.top;
  const h = rect.height;
  const y0 = Math.max(B - h, T);
  const y1 = Math.min(T, B - h);
  const yS = y0 + e.lead;
  const yE = y0 + e.span * (y1 - y0);
  if (yS === yE) return y <= yE ? 1 : 0;
  return (yS - y) / (yS - yE);
}

function apply(e: Entry) {
  const rr = e.f * e.len;
  for (const p of e.parts) {
    let v: number;
    if (p.b <= p.a) v = rr >= p.b ? 1 : 0;
    else v = Math.min(1, Math.max(0, (rr - p.a) / (p.b - p.a)));
    // 0.1% より小さい変化は書かない
    const q = Math.round(v * 1000);
    if (q === p.last) continue;
    p.last = q;
    p.anim.currentTime = (q / 1000) * DUR;
  }
}

function frame() {
  rafId = 0;
  const t0 = performance.now();
  const setup = configDirty; // 画面の大きさが変わって範囲の値を読み直したフレームは、計算の時間の記録に入れない
  // 画面の高さ・ヘッダー・電話のバーと、各絵の範囲の値（len・span・lead）だけを読み直す。
  // 各部品の動き（getAnimations）は、登録したときに1回だけ取る（画面の大きさが変わっても、動きそのものは同じ）
  if (configDirty) {
    vp = viewport();
    for (const e of entries) readConfig(e);
  }
  // 先に位置をまとめて読む
  const work: Entry[] = [];
  for (const e of entries) {
    if (!e.near && !configDirty && !e.once) continue;
    const r = e.el.getBoundingClientRect();
    if (r.height === 0) continue;
    e.f = progressOf(e, r);
    e.center = r.top + r.height / 2;
    e.once = false;
    work.push(e);
  }
  configDirty = false;
  // あとで書く
  if (mode === "js") for (const e of work) apply(e);
  const dt = performance.now() - t0;
  if (work.length && !setup) {
    costMax = Math.max(costMax, dt);
    costSum += dt;
    costN++;
    costRecent.push(dt);
    if (costRecent.length > 300) costRecent.shift();
  }
  if (debugEl) drawDebug();
}

function schedule() {
  if (!rafId) rafId = requestAnimationFrame(frame);
}
function onResize() {
  configDirty = true;
  schedule();
}

function startListening() {
  if (listening) return;
  listening = true;
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", onResize);
  window.visualViewport?.addEventListener("resize", onResize);
  window.visualViewport?.addEventListener("scroll", schedule);
  io = new IntersectionObserver(
    (list) => {
      for (const it of list) {
        for (const e of entries) {
          if (e.el !== it.target) continue;
          e.near = it.isIntersecting;
          // 遠ざかった絵も、最後に1回だけ計算する（範囲の外の形で止める）
          e.once = true;
        }
      }
      schedule();
    },
    { rootMargin: "100% 0px 100% 0px" },
  );
  for (const e of entries) io.observe(e.el);
}

// 絵（.scene-art）を登録する。css のときは ?debug=1 の表示のためだけ（動きには何もしない）
export function registerScene(el: HTMLElement, name: string): () => void {
  const m = sceneMode();
  if (m === "css" && !isDebug()) return () => {};
  if (m !== "css" && m !== "js") return () => {};
  if (m === "js") el.dataset.scene = "js";
  const e: Entry = { el, name, parts: [], near: false, len: 56, span: 0.5, lead: 0, f: 0, center: 0, once: true };
  entries.add(e);
  if (isDebug()) ensureDebug();
  startListening();
  io?.observe(el);
  // 登録したその場で、範囲の値と動きを取り、今の位置の形にする（画面のちらつきを短くする）
  vp = viewport();
  readConfig(e);
  if (m === "js") {
    collectParts(e);
    const r = el.getBoundingClientRect();
    if (r.height > 0) {
      e.f = progressOf(e, r);
      e.center = r.top + r.height / 2;
      apply(e);
    }
  }
  schedule();
  return () => {
    entries.delete(e);
    io?.unobserve(el);
    if (m === "js") delete el.dataset.scene;
  };
}

// ─── ?debug=1 の表示 ───
export function ensureDebug() {
  if (debugEl || typeof document === "undefined" || !isDebug()) return;
  debugEl = document.createElement("div");
  debugEl.setAttribute("aria-hidden", "true");
  debugEl.id = "scene-debug";
  debugEl.style.cssText =
    "position:fixed;top:calc(var(--header-h,64px) + 4px);right:4px;z-index:9999;pointer-events:none;" +
    "font:11px/1.45 ui-monospace,Menlo,monospace;color:#fff;background:rgba(0,0,0,.72);padding:4px 6px;border-radius:4px;" +
    "white-space:pre;max-width:60vw";
  document.body.appendChild(debugEl);
  if (sceneMode() !== "css" && sceneMode() !== "js") {
    // 動きのない形（time・none）でも、どれで動いているかと画面の高さだけは出す
    vp = viewport();
    drawDebug();
    window.addEventListener("scroll", () => drawDebug(), { passive: true });
  }
}

function drawDebug() {
  if (!debugEl) return;
  const m = sceneMode();
  const label = m === "css" ? "CSS" : m === "js" ? "JS" : m === "time" ? "時間で1回" : "動きなし";
  const mid = (vp.T + vp.B) / 2;
  let best: Entry | null = null;
  for (const e of entries) {
    if (!e.near) continue;
    if (!best || Math.abs(e.center - mid) < Math.abs(best.center - mid)) best = e;
  }
  const pct = best ? Math.round(Math.min(1, Math.max(0, best.f)) * 100) : null;
  const lines = [
    label,
    best ? `${best.name} ${pct}%  (中心の差 ${Math.round(best.center - mid)}px)` : "（近くに絵なし）",
    `vv ${Math.round(vp.vvH)}  ヘッダー ${Math.round(vp.headerH)}  電話 ${Math.round(vp.barH)}`,
  ];
  if (m === "js" && costN) {
    const sorted = [...costRecent].sort((a, b) => a - b);
    const p95 = sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * 0.95))];
    lines.push(`計算 平均 ${(costSum / costN).toFixed(2)}ms / 95% ${p95.toFixed(2)}ms / 最大 ${costMax.toFixed(2)}ms`);
  }
  debugEl.textContent = lines.join("\n");
  debugEl.dataset.mode = label;
  debugEl.dataset.name = best?.name ?? "";
  debugEl.dataset.progress = best ? String(best.f) : "";
}
