import type { ReactNode } from "react";

// ─── 語の途中で折り返さないかたまり ───
// 文の中の、words に挙げた語を、それぞれ折り返さないかたまり（span.whitespace-nowrap）で囲む。
// 文そのものは変えない。かたまりの前後では、ふつうに折り返せる。
// ・iPhone の Safari は word-break: auto-phrase（文の区切りで折り返す指定）が効かず、
//   日本語を字と字のあいだのどこででも折り返す。そのため、語の途中で折れてほしくない所は、この形で守る
//   （auto-phrase は Chrome・Edge では今までどおり効く。Safari では、このかたまりだけが効く）
// ・長い語が重なるときは、長いほうを先に当てる
// ・かたまりは、狭い画面（320px）の1行より短くすること（1行に入らないと、はみ出す）
// 使っている所：トップの OUR STORY（app/page.tsx）、店主紹介（app/owner/page.tsx）、店舗情報（app/info/page.tsx）
export function keepWords(text: string, words: readonly string[]): ReactNode[] {
  if (words.length === 0) return [text];
  const sorted = [...words].sort((a, b) => b.length - a.length);
  const re = new RegExp(`(${sorted.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "g");
  return text
    .split(re)
    .filter((part) => part !== "")
    .map((part, i) =>
      sorted.includes(part) ? (
        <span key={i} className="whitespace-nowrap">
          {part}
        </span>
      ) : (
        part
      ),
    );
}
