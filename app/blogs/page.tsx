import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Pagination } from "@/components/Pagination";
import { PostListClient } from "@/components/PostListClient";
import { getPostsPage } from "@/lib/posts";

export const metadata: Metadata = {
  title: "博客",
  description:
    "TradingView 交易图表开发教程文章列表，涵盖 Charting Library 集成、自定义 Datafeed、以及对接 iTick API 的实战细节。",
  alternates: { canonical: "/blogs" },
  openGraph: {
    title: "博客",
    description:
      "TradingView 交易图表开发教程文章列表，涵盖 Charting Library 集成、自定义 Datafeed、以及对接 iTick API 的实战细节。",
    url: "/blogs",
  },
};

const PAGE_SIZE = 12;

export default function BlogsPage() {
  const { items, page, pageCount } = getPostsPage(1, PAGE_SIZE);

  return (
    <div>
      <Breadcrumbs items={[{ label: "首页", href: "/" }, { label: "博客" }]} />
      <div className="container py-10">
        <h1 className="text-2xl font-semibold">博客</h1>
        <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
          全部文章均围绕 TradingView 与 iTick 数据对接展开，适合从入门到进阶循序阅读。
        </p>

        <div className="mt-8">
          <PostListClient posts={items} />
          <Pagination basePath="/blogs" page={page} pageCount={pageCount} />
        </div>
      </div>
    </div>
  );
}
