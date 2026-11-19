import type { Metadata } from "next";
import Link from "next/link";
import PageHeading from "./components/PageHeading";
import { WashiSheet, WASHI_LINK } from "./components/Washi";

// ─── 見つからないページ（404） ───
// 見た目はほかのページと同じ決まり：見出しの帯（PageHeading）と、その下の1枚の和紙（WashiSheet）。
// 和紙の中は、短いおわびと、はじめに・お品書き・ご案内への入口だけ。
// ・noindex は Next.js が付ける（404 のページにはいつも <meta name="robots" content="noindex">）
// ・canonical は出さない（layout.tsx のトップの canonical を受け継がないよう、null で消す）。
//   og:url も同じ理由で出さない（openGraph を、url を持たない形で上書きする）

const TITLE = "ページが見つかりませんでした｜IZAKAYA きたげん";

export const metadata: Metadata = {
  title: TITLE,
  description: "お探しのページは見つかりませんでした。IZAKAYA きたげんの、はじめに・お品書き・ご案内のページからお探しください。",
  alternates: { canonical: null },
  openGraph: { title: TITLE, siteName: "きたげん", locale: "ja_JP", type: "website" },
  twitter: { card: "summary", title: TITLE },
};

const LINKS = [
  { href: "/", label: "はじめに（トップ）" },
  { href: "/menu/dinner", label: "お品書き" },
  { href: "/info", label: "ご案内（営業時間・場所）" },
] as const;

export default function NotFound() {
  return (
    // ほかのページと違い min-h-screen は付けない（中身が短いので、和紙とフッターのあいだに空の帯ができるため）
    <div>
      <PageHeading title="ページが見つかりませんでした" lead="移動したか、なくなったページかもしれません。" />
      <WashiSheet>
        <div className="py-8 md:py-10 text-center">
          {/* 390px の画面でも1行に収まる長さ（語の途中で折れないように） */}
          <p className="text-base leading-[1.95] text-foreground">
            下のページから、お探しください。
          </p>
          {/* 入口は縦に並べる。押せる範囲は高さ 44px（py-3）、上下の入口の押せる範囲が重ならないよう、あきは 8px */}
          <ul className="mt-6 flex flex-col items-center gap-2">
            {LINKS.map(({ href, label }) => (
              <li key={href}>
                <Link href={href} className={`${WASHI_LINK} py-3`}>
                  {label} →
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </WashiSheet>
    </div>
  );
}
