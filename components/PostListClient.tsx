"use client";

import { useMemo, useState } from "react";
import type { PostMeta } from "@/lib/posts";
import { PostCard } from "@/components/PostCard";
import { Search } from "lucide-react";

function normalize(s: string) {
  return s.trim().toLowerCase();
}

function scoreMatch(query: string, haystack: string) {
  const q = normalize(query);
  const h = normalize(haystack);
  if (!q) return 0;
  if (h.includes(q)) return 100;

  let qi = 0;
  let hit = 0;
  for (let i = 0; i < h.length && qi < q.length; i++) {
    if (h[i] === q[qi]) {
      qi++;
      hit++;
    }
  }
  return hit === q.length ? 60 : hit;
}

export function PostListClient({ posts }: { posts: PostMeta[] }) {
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState<string | null>(null);

  const tags = useMemo(() => {
    const set = new Set<string>();
    for (const p of posts) for (const t of p.tags) set.add(t);
    return Array.from(set).sort((a, b) => a.localeCompare(b, "zh"));
  }, [posts]);

  const filtered = useMemo(() => {
    const q = normalize(query);

    return posts
      .filter((p) => (tag ? p.tags.includes(tag) : true))
      .map((p) => {
        const s =
          scoreMatch(q, p.title) +
          scoreMatch(q, p.description) +
          scoreMatch(q, p.tags.join(" "));
        return { p, s };
      })
      .filter((x) => (q ? x.s > 0 : true))
      .sort((a, b) => b.s - a.s)
      .map((x) => x.p);
  }, [posts, query, tag]);

  return (
    <div className="flex flex-col gap-5">
      <section
        className="relative overflow-hidden rounded-2xl border border-border bg-card p-4 md:p-5"
        style={{
          background:
            "radial-gradient(900px 260px at 20% 0%, color-mix(in oklab, var(--accent) 16%, transparent), transparent), radial-gradient(760px 240px at 85% 30%, color-mix(in oklab, var(--accent-2) 14%, transparent), transparent), var(--card)",
        }}
      >
        <div className="pointer-events-none absolute -top-28 left-10 h-56 w-56 rounded-full opacity-40 blur-3xl"
          style={{
            background:
              "radial-gradient(circle at 30% 30%, color-mix(in oklab, var(--accent) 55%, transparent), transparent 60%)",
          }}
        />
        <div className="pointer-events-none absolute -bottom-32 right-6 h-64 w-64 rounded-full opacity-30 blur-3xl"
          style={{
            background:
              "radial-gradient(circle at 40% 40%, color-mix(in oklab, var(--accent-2) 55%, transparent), transparent 60%)",
          }}
        />

        <div className="relative flex flex-col gap-3 md:gap-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <div className="text-sm font-semibold">搜索与标签</div>
              <div className="mt-1 text-xs text-muted-2">
                支持对标题 / 描述 / 标签进行模糊匹配
              </div>
            </div>

            <div className="group relative w-full md:w-[420px]">
              <div
                className="pointer-events-none absolute -inset-2 rounded-full opacity-0 blur-xl transition-opacity duration-300 group-focus-within:opacity-100"
                style={{
                  background:
                    "linear-gradient(135deg, color-mix(in oklab, var(--accent) 55%, transparent), color-mix(in oklab, var(--accent-2) 55%, transparent))",
                }}
              />
              <div className="relative rounded-full border border-border bg-card-2/30 p-[1px] transition-colors group-focus-within:border-transparent group-focus-within:bg-[linear-gradient(135deg,var(--accent),var(--accent-2))]">
                <div className="flex items-center gap-2 rounded-full bg-card px-4 py-2.5">
                  <Search className="h-4 w-4 text-muted" aria-hidden="true" />
                  <label htmlFor="post-search" className="sr-only">
                    搜索文章
                  </label>
                  <input
                    id="post-search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="搜索标题 / 描述 / 标签"
                    className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-2"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setTag(null)}
              aria-pressed={tag === null}
              className="relative inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-all duration-200 hover:-translate-y-px hover:bg-card-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)]"
              style={{
                borderColor:
                  tag === null
                    ? "color-mix(in oklab, var(--accent) 35%, var(--border))"
                    : "var(--border)",
                color: tag === null ? "var(--accent-foreground)" : "var(--muted)",
                background:
                  tag === null
                    ? "linear-gradient(135deg, var(--accent), var(--accent-2))"
                    : "transparent",
                boxShadow:
                  tag === null
                    ? "0 0 0 1px color-mix(in oklab, var(--accent) 18%, transparent), 0 14px 32px var(--surface-glow)"
                    : "none",
              }}
            >
              全部
            </button>
            {tags.map((t) => {
              const active = tag === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTag((cur) => (cur === t ? null : t))}
                  aria-pressed={active}
                  className="relative inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-all duration-200 hover:-translate-y-px hover:bg-card-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)]"
                  style={{
                    borderColor: active
                      ? "color-mix(in oklab, var(--accent) 35%, var(--border))"
                      : "var(--border)",
                    color: active ? "var(--accent-foreground)" : "var(--muted)",
                    background: active
                      ? "linear-gradient(135deg, var(--accent), var(--accent-2))"
                      : "transparent",
                    boxShadow: active
                      ? "0 0 0 1px color-mix(in oklab, var(--accent) 18%, transparent), 0 14px 32px var(--surface-glow)"
                      : "none",
                  }}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <div className="grid auto-rows-fr gap-5 md:gap-6 grid-cols-[repeat(auto-fill,minmax(260px,1fr))]">
        {filtered.map((p) => (
          <PostCard key={p.slug} post={p} />
        ))}
      </div>
    </div>
  );
}
