import Link from "next/link";
import { getAnnouncements } from "../lib/announcements";
import NewsCard from "../components/NewsCard";
import SectionInner from "../components/SectionInner";
import { pageMetadata } from "../lib/seo";

export const metadata = pageMetadata({
  title: "お知らせ｜きたげん",
  description: "きたげんからのお知らせ・最新情報をご確認いただけます。",
  path: "/news",
});

const PER_PAGE = 10;

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const currentPage = Math.max(1, parseInt(pageParam ?? "1", 10));

  const allItems = await getAnnouncements();
  const totalPages = Math.ceil(allItems.length / PER_PAGE);
  const safePage = Math.min(currentPage, Math.max(1, totalPages));
  const items = allItems.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  return (
    <div className="pt-16">

      {/* ── ページヘッダー ───────────────────────────────── */}
      <section className="section-warm py-16 md:py-20 border-b border-foreground/15">
        <SectionInner className="text-center">
          <p className="text-[10px] md:text-[11px] tracking-[0.45em] text-accent/80 mb-2">NEWS</p>
          <h1 className="text-3xl md:text-4xl font-bold">お知らせ</h1>
          <div className="flex items-center justify-center gap-3 mt-4">
            <div className="w-8 h-px bg-accent/50" />
            <div className="w-1 h-1 rounded-full bg-accent/70" />
            <div className="w-8 h-px bg-accent/50" />
          </div>
          <p className="text-sm md:text-base text-muted mt-4">きたげんからの最新情報</p>
        </SectionInner>
      </section>

      {/* ── お知らせ一覧 ────────────────────────────────── */}
      <section className="py-24 md:py-28 section-light">
        <SectionInner maxW="max-w-4xl">

          {allItems.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted text-sm">現在お知らせはありません。</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {items.map((item) => (
                  <NewsCard key={item.id} item={item} />
                ))}
              </div>

              {/* ── ページネーション ─────────────────────── */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12">

                  {/* 前へ */}
                  {safePage > 1 ? (
                    <Link
                      href={`/news?page=${safePage - 1}`}
                      className="px-4 py-2 text-sm text-accent border border-accent/40 rounded-sm hover:bg-accent/5 transition-colors"
                    >
                      ← 前へ
                    </Link>
                  ) : (
                    <span className="px-4 py-2 text-sm text-muted/40 border border-border/30 rounded-sm cursor-not-allowed">
                      ← 前へ
                    </span>
                  )}

                  {/* ページ番号 */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <Link
                        key={p}
                        href={`/news?page=${p}`}
                        className={`w-9 h-9 flex items-center justify-center text-sm rounded-sm transition-colors ${
                          p === safePage
                            ? "bg-accent text-white"
                            : "text-muted hover:text-accent hover:bg-accent/5"
                        }`}
                      >
                        {p}
                      </Link>
                    ))}
                  </div>

                  {/* 次へ */}
                  {safePage < totalPages ? (
                    <Link
                      href={`/news?page=${safePage + 1}`}
                      className="px-4 py-2 text-sm text-accent border border-accent/40 rounded-sm hover:bg-accent/5 transition-colors"
                    >
                      次へ →
                    </Link>
                  ) : (
                    <span className="px-4 py-2 text-sm text-muted/40 border border-border/30 rounded-sm cursor-not-allowed">
                      次へ →
                    </span>
                  )}

                </div>
              )}

              {/* 件数表示 */}
              {totalPages > 1 && (
                <p className="text-xs text-muted text-center mt-4">
                  {allItems.length} 件中 {(safePage - 1) * PER_PAGE + 1}〜{Math.min(safePage * PER_PAGE, allItems.length)} 件を表示
                </p>
              )}
            </>
          )}

        </SectionInner>
      </section>

    </div>
  );
}
