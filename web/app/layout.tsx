import type { Metadata } from "next";
// フォントはサイトの中に持たせる（ビルドのたびに Google Fonts へ取りに行かない）。
// @fontsource のファイルはビルド時に node_modules から出力される。文字の範囲ごとに分かれているので、
// ブラウザはページで使う文字を含むファイルだけを読む。太さは使うものだけ（400・500・700）。
// font-family 名は "Noto Sans JP"（globals.css の --font-noto-sans-jp）。
import "@fontsource/noto-sans-jp/400.css";
import "@fontsource/noto-sans-jp/500.css";
import "@fontsource/noto-sans-jp/700.css";
import Link from "next/link";
import Header from "./components/Header";
import StructuredData from "./components/StructuredData";
import MobileCallBar from "./components/MobileCallBar";
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


function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    // lg より狭い画面では、下に固定した「電話する」ボタン（MobileCallBar・52px ＋ safe-area）に
    // 隠れないよう、フッターの下に同じ高さのあきを足す
    <footer className="border-t border-border bg-card-bg pb-[calc(52px+env(safe-area-inset-bottom))] lg:pb-0">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <p className="text-lg font-bold text-accent">きたげん</p>
            <p className="text-sm text-muted">落ち着いて飲める、ちゃんとした居酒屋。</p>
          </div>
          {/* ヘッダーを4タブに絞ったため、外したトップ・お知らせは
              フッターから辿れるようにまとめる。項目が増えたら折り返す。 */}
          <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted">
            <li>
              <Link href="/" className="hover:text-foreground transition-colors">
                トップ
              </Link>
            </li>
            <li>
              <Link href="/menu" className="hover:text-foreground transition-colors">
                メニュー
              </Link>
            </li>
            <li>
              <Link href="/info" className="hover:text-foreground transition-colors">
                店舗情報
              </Link>
            </li>
            <li>
              <Link href="/news" className="hover:text-foreground transition-colors">
                お知らせ
              </Link>
            </li>
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
    <html lang="ja">
      <body className="font-sans antialiased">
        <StructuredData />
        <Header />
        <main className="pt-16">{children}</main>
        <Footer />
        <MobileCallBar />
      </body>
    </html>
  );
}
