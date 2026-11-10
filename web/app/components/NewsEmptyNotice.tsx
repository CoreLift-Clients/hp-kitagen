// お知らせが無いときの案内（トップのお知らせ欄・/news 共通）。
// 最新情報は Instagram で発信しているため、そちらへ案内する。

import { INSTAGRAM_URL } from "../lib/contact";

export default function NewsEmptyNotice() {
  return (
    <div className="text-center py-10">
      <p className="text-sm md:text-base text-muted leading-relaxed">
        最新情報は
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent underline underline-offset-2 decoration-accent/40 hover:decoration-accent transition-colors"
        >
          Instagram
        </a>
        でお知らせしています。
      </p>
    </div>
  );
}
