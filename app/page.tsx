import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { PostCard } from "@/components/PostCard";
import { getAllPosts } from "@/lib/posts";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: "/",
  },
};

export default function Home() {
  const all = getAllPosts();
  const featured = all.filter((p) => p.featured === true).slice(0, 3);
  const latest = all.slice(0, 9);

  return (
    <div>
      <section
        className="w-full border-b"
        style={{
          borderColor: "var(--border)",
          background:
            "radial-gradient(1200px 500px at 20% 10%, color-mix(in oklab, var(--accent) 18%, transparent), transparent), radial-gradient(800px 400px at 80% 30%, color-mix(in oklab, var(--accent-2) 14%, transparent), transparent), var(--background)",
        }}
      >
        <div className="container py-16 text-center md:py-24">
          <h1
            className="text-4xl font-bold tracking-tight text-transparent md:text-5xl lg:text-6xl"
            style={{
              backgroundImage:
                "linear-gradient(90deg, #3B82F6 0%, #6366F1 28%, #8B5CF6 52%, #D946EF 76%, #F59E0B 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
            }}
          >
            TradingView 交易图表开发教程
          </h1>
          <p
            className="mx-auto mt-6 max-w-2xl text-lg md:text-xl"
            style={{ color: "var(--muted)" }}
          >
            以 TradingView Charting Library 集成为主线，结合 iTick 提供的实时与历史
            行情数据，手把手讲清楚 Datafeed、指标叠加、事件交互与性能优化。
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/blogs"
              className="px-6 py-3 rounded-full text-sm font-semibold transition-all hover:-translate-y-0.5 hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)]"
              style={{
                color: "var(--foreground)",
                background:
                  "linear-gradient(135deg, color-mix(in oklab, var(--accent) 18%, transparent), color-mix(in oklab, var(--accent-2) 16%, transparent))",
                boxShadow:
                  "0 18px 42px color-mix(in oklab, var(--surface-glow-2) 70%, transparent)",
              }}
            >
              开始阅读
            </Link>
            <a
              href="https://itick.org/zh-cn"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all hover:-translate-y-0.5 hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)]"
              style={{
                color: "var(--accent-foreground)",
                background:
                  "linear-gradient(135deg, color-mix(in oklab, var(--accent) 92%, var(--background)), color-mix(in oklab, var(--accent-2) 92%, var(--background)))",
                boxShadow:
                  "0 18px 42px var(--surface-glow)",
              }}
            >
              立即接入 iTick
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      <div className="container py-10">
        <section className="py-6">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-xl font-semibold">精选文章</h2>
          <Link
            href="/blogs"
            className="text-sm"
            style={{ color: "var(--muted)" }}
          >
            查看全部
          </Link>
        </div>
        <div className="mt-4 grid auto-rows-fr gap-5 md:gap-6 grid-cols-[repeat(auto-fit,minmax(260px,1fr))]">
          {featured.map((p) => (
            <PostCard key={p.slug} post={p} featuredBadge />
          ))}
        </div>
      </section>

      <section className="py-6">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-xl font-semibold">最新文章</h2>
          <Link
            href="/blogs"
            className="text-sm"
            style={{ color: "var(--muted)" }}
          >
            查看列表
          </Link>
        </div>
        <div className="mt-4 grid auto-rows-fr gap-5 md:gap-6 grid-cols-[repeat(auto-fit,minmax(260px,1fr))]">
          {latest.map((p) => (
            <PostCard key={p.slug} post={p} />
          ))}
        </div>
      </section>
      </div>
    </div>
  );
}
