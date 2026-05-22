import Link from "next/link";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

export function Pagination({
  basePath,
  page,
  pageCount,
}: {
  basePath: string;
  page: number;
  pageCount: number;
}) {
  if (pageCount <= 1) return null;

  const hrefFor = (p: number) => (p <= 1 ? basePath : `${basePath}/page/${p}`);
  const prevHref = hrefFor(page - 1);
  const nextHref = hrefFor(page + 1);

  const pages = (() => {
    const clamp = (n: number) => Math.min(pageCount, Math.max(1, n));
    const cur = clamp(page);

    if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i + 1);

    const windowStart = clamp(cur - 1);
    const windowEnd = clamp(cur + 1);

    const set = new Set<number>();
    set.add(1);
    set.add(pageCount);
    for (let p = windowStart; p <= windowEnd; p++) set.add(p);

    const sorted = Array.from(set).sort((a, b) => a - b);
    const result: Array<number | "ellipsis"> = [];

    for (let i = 0; i < sorted.length; i++) {
      const current = sorted[i];
      const prev = sorted[i - 1];
      if (i > 0 && current - prev > 1) result.push("ellipsis");
      result.push(current);
    }

    return result;
  })();

  return (
    <nav
      className="pt-10 flex items-center justify-center"
      aria-label="分页"
    >
      <div className="inline-flex items-center gap-2">
        {page > 1 ? (
          <Link
            href={prevHref}
            aria-label="上一页"
            rel="prev"
            className="h-10 w-10 inline-flex items-center justify-center rounded-full border border-border bg-card transition-all hover:-translate-y-px hover:bg-card-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)]"
          >
            <ChevronLeft className="h-4 w-4 text-foreground" aria-hidden="true" />
          </Link>
        ) : (
          <span className="h-10 w-10 inline-flex items-center justify-center rounded-full border border-border bg-card opacity-40">
            <ChevronLeft className="h-4 w-4 text-foreground" aria-hidden="true" />
          </span>
        )}

        <div className="inline-flex items-center gap-1">
          {pages.map((p, idx) => {
            if (p === "ellipsis") {
              return (
                <span
                  key={`e-${idx}`}
                  className="h-10 w-10 inline-flex items-center justify-center"
                  style={{ color: "var(--muted)" }}
                >
                  <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                </span>
              );
            }

            const active = p === page;
            return active ? (
              <span
                key={p}
                aria-current="page"
                className="h-10 min-w-10 px-4 inline-flex items-center justify-center rounded-full text-sm font-semibold"
                style={{
                  color: "var(--accent-foreground)",
                  background:
                    "linear-gradient(135deg, var(--accent), var(--accent-2))",
                  boxShadow:
                    "0 0 0 1px color-mix(in oklab, var(--accent) 18%, transparent), 0 14px 32px var(--surface-glow)",
                }}
              >
                {p}
              </span>
            ) : (
              <Link
                key={p}
                href={hrefFor(p)}
                aria-label={`第 ${p} 页`}
                className="h-10 min-w-10 px-4 inline-flex items-center justify-center rounded-full border border-border bg-card text-sm font-medium transition-all hover:-translate-y-px hover:bg-card-2 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)]"
                style={{ color: "var(--muted)" }}
              >
                {p}
              </Link>
            );
          })}
        </div>

        {page < pageCount ? (
          <Link
            href={nextHref}
            aria-label="下一页"
            rel="next"
            className="h-10 w-10 inline-flex items-center justify-center rounded-full border border-border bg-card transition-all hover:-translate-y-px hover:bg-card-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)]"
          >
            <ChevronRight className="h-4 w-4 text-foreground" aria-hidden="true" />
          </Link>
        ) : (
          <span className="h-10 w-10 inline-flex items-center justify-center rounded-full border border-border bg-card opacity-40">
            <ChevronRight className="h-4 w-4 text-foreground" aria-hidden="true" />
          </span>
        )}
      </div>
    </nav>
  );
}
