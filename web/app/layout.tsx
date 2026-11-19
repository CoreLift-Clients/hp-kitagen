import type { Metadata, Viewport } from "next";
// フォントはサイトの中に持たせる（ビルドのたびに Google Fonts へ取りに行かない）。
// @fontsource のファイルはビルド時に node_modules から出力される。文字の範囲ごとに分かれているので、
// ブラウザはページで使う文字を含むファイルだけを読む。太さは使うものだけ（400・500・700）。
// font-family 名は "Noto Sans JP"（globals.css の --font-noto-sans-jp）。
import "@fontsource/noto-sans-jp/400.css";
import "@fontsource/noto-sans-jp/500.css";
import "@fontsource/noto-sans-jp/700.css";
// 明朝体（Noto Serif JP。globals.css の --font-noto-serif-jp、Tailwind の font-serif）。
// ヘッダーのロゴ（700）・項目名（500。スマホのメニューのいまのページは 700）、ページの見出し（PageHeading・700）、
// フッターの店名（700）はどのページにも出るので、ここで読み込む
import "@fontsource/noto-serif-jp/500.css";
import "@fontsource/noto-serif-jp/700.css";
import Link from "next/link";
import Header from "./components/Header";
import { NAV_LINKS } from "./lib/nav";
import StructuredData from "./components/StructuredData";
import MobileCallBar from "./components/MobileCallBar";
import ScrollToTop from "./components/ScrollToTop";
import { SITE_URL, OG_IMAGE } from "./lib/seo";
import "./globals.css";

const TITLE       = "IZAKAYA きたげん｜桃谷の居酒屋【公式サイト】";
const DESCRIPTION = "桃谷の居酒屋「IZAKAYA きたげん」公式サイト。こだわりの料理とお酒を楽しめるお店です。ランチ・ディナー・テイクアウト対応。宴会や飲み会にもおすすめ。";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  keywords: ["きたげん", "桃谷 居酒屋", "大阪 居酒屋"],
  icons: {
    icon: [
      { url: "/favicon.ico",  sizes: "any" },
      { url: "/favicon.png",  type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: "きたげん",
    locale: "ja_JP",
    type: "website",
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: TITLE,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [OG_IMAGE],
  },
  // canonical はトップページ（/）専用。下層ページは各 page.tsx が
  // pageMetadata() で自分自身のURLに上書きするため、ここの値は継承されない。
  alternates: {
    canonical: SITE_URL,
  },
};

// 画面の大きさの指定。viewportFit: "cover" で、iPhone の画面の端（丸い角・切り欠き・ホームのバー）の
// 大きさが env(safe-area-inset-*) で分かるようにする（付けないと iOS では env() がいつも 0）。
// その分、下に固定した「電話する」・メニューの板・トップの写真の場面・フッター・ヘッダーと、
// 中身の左右の余白（SectionInner）で、env() の分をあけている。パソコンと Android では env() は 0 で、見た目は変わらない
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    // md より狭い画面では、下に固定した「電話する」ボタン（MobileCallBar・52px ＋ safe-area）に
    // 隠れないよう、フッターの下に同じ高さのあきを足す。md 以上は safe-area の分だけ（iPad のホームのバー。ほかの端末では 0）。
    // 左右は、iPhone の横向きの丸い角・切り欠きより狭くしない（ほかの端末では今までの 16px）
    <footer className="border-t border-border bg-card-bg pb-[calc(52px+env(safe-area-inset-bottom))] md:pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-5xl mx-auto pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <p className="font-serif text-lg font-bold text-accent">きたげん</p>
            <p className="text-sm text-muted">落ち着いて飲める、ちゃんとした居酒屋。</p>
          </div>
          {/* 並びは、ヘッダー・スマホのメニューと同じ項目（lib/nav.ts の NAV_LINKS：はじめに・お品書き・ご案内・ごあいさつ）。
              お知らせのページはやめた（お知らせは、ご案内のページの欄からインスタグラムへ）。
              390px でも1行に収まるよう、あきは 20px。項目が増えたら折り返す。
              押せる範囲は高さ 44px（py-3。上下にはみ出す 12px ずつは -my-3 で戻し、並びと見た目は今までのまま）。
              折り返したときに、上下の行の押せる範囲が重ならないよう、行のあきは 24px（gap-y-6） */}
          <ul className="flex flex-wrap justify-center gap-x-5 gap-y-6 text-sm text-muted">
            {NAV_LINKS.map(({ href, label }) => (
              <li key={href}>
                <Link href={href} className="inline-block py-3 -my-3 hover:text-foreground transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <p className="text-center text-xs text-muted mt-6">
          &copy; {currentYear} きたげん All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // data-scroll-behavior="smooth"：html の scroll-behavior: smooth（globals.css）を、ページを移るときだけ Next.js が止める
    // （付けないと、移ったあとのスクロールが下から滑らかに流れる）。ページを移ったら上から始めるのは ScrollToTop
    <html lang="ja" data-scroll-behavior="smooth">
      <body className="font-sans antialiased">
        <StructuredData />
        <ScrollToTop />
        <Header />
        {/* 固定ヘッダーの下に中身を逃がす（高さは globals.css の --header-h） */}
        <main className="pt-[var(--header-h)]">{children}</main>
        <Footer />
        <MobileCallBar />
      </body>
    </html>
  );
}
