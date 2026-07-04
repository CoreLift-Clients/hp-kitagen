import type { Metadata } from "next";

/**
 * サイト共通のSEO定数と、各ページのメタデータ生成ヘルパー。
 *
 * canonical / openGraph は「そのページ自身のURL」を指す必要がある。
 * ルート layout.tsx の値がそのまま子ページへ継承されると、全ページが
 * トップページを正規URL・OG URLとして宣言してしまうため、下層ページは
 * このヘルパーで自分自身のURLを明示的に上書きする。
 */

// トップページのcanonical・構造化データと同じ正規ドメイン。
export const SITE_URL = "https://www.kitagen-izakaya.com";
export const SITE_NAME = "きたげん";
export const OG_IMAGE = "/og.png";

type PageMetaInput = {
  /** ページのtitle（<title> と og:title に使用） */
  title: string;
  /** ページのdescription（meta description と og:description に使用） */
  description: string;
  /** サイトルートからのパス（先頭スラッシュ付き。例: "/menu/dinner"） */
  path: string;
};

/**
 * 各公開ページ用のメタデータを生成する。
 * title / description を一度渡すだけで、canonical・openGraph・twitter が
 * すべてそのページ自身のURLと文言で揃う。
 */
export function pageMetadata({ title, description, path }: PageMetaInput): Metadata {
  const url = `${SITE_URL}${path}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      locale: "ja_JP",
      type: "website",
      images: [
        {
          url: OG_IMAGE,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [OG_IMAGE],
    },
  };
}
