// web/app/lib/site-images.ts
//
// トップページなどの写真。public/images/ の画像を使う（外部の API・画像サービスには頼らない）。
// 写真を差し替えるときは、public/images/ の同じ名前のファイルを上書きする。
// 画像のパスは site-image-defaults.ts、読み込み口は app/content/index.ts。

import { getSiteImages as loadSiteImages, type SiteImages } from "../content";
import { DEFAULT_SITE_IMAGES } from "./site-image-defaults";

export { DEFAULT_SITE_IMAGES };
export type { SiteImages };

export async function getSiteImages(): Promise<SiteImages> {
  return loadSiteImages();
}
