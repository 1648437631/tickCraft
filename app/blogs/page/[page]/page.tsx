import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Pagination } from "@/components/Pagination";
import { PostListClient } from "@/components/PostListClient";
import { getAllPosts, getPostsPage } from "@/lib/posts";

const PAGE_SIZE = 12;
export const dynamicParams = false;

function getValidPageOr404(pageParam: string) {
  const page = Number(pageParam);
  const total = getAllPosts().length;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  if (!Number.isInteger(page) || page <= 1 || page > pageCount) {
    notFound();
  }

  return { page, pageCount };
}

export function generateStaticParams() {
  const total = getAllPosts().length;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  return Array.from({ length: pageCount }, (_, i) => i + 1)
    .slice(1)
    .map((p) => ({ page: String(p) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ page: string }>;
}): Promise<Metadata> {
  const { page: pageParam } = await params;
  const { page } = getValidPageOr404(pageParam);

  return {
    title: `博客第 ${page} 页`,
    description: `TradingView 图表开发教程文章列表分页，第 ${page} 页。`,
    alternates: { canonical: `/blogs/page/${page}` },
    openGraph: {
      title: `博客第 ${page} 页`,
      description: `TradingView 图表开发教程文章列表分页，第 ${page} 页。`,
      url: `/blogs/page/${page}`,
    },
  };
}

export default async function BlogsPaged({
  params,
}: {
  params: Promise<{ page: string }>;
}) {
  const { page: pageParam } = await params;
  const { page, pageCount } = getValidPageOr404(pageParam);
  const { items, page: current } = getPostsPage(page, PAGE_SIZE);

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: "首页", href: "/" },
          { label: "博客", href: "/blogs" },
          { label: `第 ${current} 页` },
        ]}
      />
      <div className="container py-10">
        <h1 className="text-2xl font-semibold">博客</h1>
        <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
          第 {current} 页 / 共 {pageCount} 页
        </p>

        <div className="mt-8">
          <PostListClient posts={items} />
          <Pagination basePath="/blogs" page={current} pageCount={pageCount} />
        </div>
      </div>
    </div>
  );
}
