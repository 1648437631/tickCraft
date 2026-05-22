import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Calendar, Clock, ExternalLink, Tag } from "lucide-react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { MarkdownContent } from "@/components/MarkdownContent";
import { PostCard } from "@/components/PostCard";
import { TableOfContents } from "@/components/TableOfContents";
import { renderMarkdown } from "@/lib/markdown";
import {
  getAllPostSlugs,
  getPostBySlug,
  getPrevNext,
  getRelatedPosts,
} from "@/lib/posts";
import { absoluteUrl } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  let post;
  try {
    post = getPostBySlug(slug);
  } catch {
    notFound();
  }
  const url = `/posts/${post.slug}`;

  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      url,
      images: [{ url: absoluteUrl(`/images/${post.coverImage}`) }],
    },
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let post;
  try {
    post = getPostBySlug(slug);
  } catch {
    notFound();
  }
  const { html, toc } = await renderMarkdown(post.content);
  const related = getRelatedPosts(post.slug, 3);
  const { prev, next } = getPrevNext(post.slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": absoluteUrl(`/posts/${post.slug}`),
    },
    author: {
      "@type": "Person",
      name: "TradingView 图表开发教程",
    },
    publisher: {
      "@type": "Organization",
      name: "TradingView 图表开发教程",
    },
    image: [absoluteUrl(`/images/${post.coverImage}`)],
  };

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: "首页", href: "/" },
          { label: "博客", href: "/blogs" },
          { label: post.title },
        ]}
        action={{ label: "返回列表", href: "/blogs" }}
      />
      <div className="container py-10">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0 space-y-10">
            <article
              className="w-full overflow-hidden rounded-[1.5rem] border border-border bg-card/70 backdrop-blur-sm"
              style={{
                boxShadow:
                  "0 24px 90px color-mix(in oklab, var(--accent) 8%, transparent)",
              }}
            >
              <header>
                <div
                  className="relative overflow-hidden border-b border-border"
                  style={{
                    boxShadow:
                      "0 40px 120px color-mix(in oklab, var(--accent) 12%, transparent)",
                  }}
                >
                  <div className="relative aspect-[16/9] w-full">
                    <Image
                      src={`/images/${post.coverImage}`}
                      alt={post.title}
                      fill
                      className="object-cover"
                      priority
                      sizes="(max-width: 768px) 100vw, 720px"
                    />
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.35) 40%, rgba(0,0,0,0.78) 100%)",
                      }}
                    />
                    <div className="absolute inset-x-0 bottom-0 p-5 md:p-8">
                      <div
                        className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium"
                        style={{ color: "rgba(255,255,255,0.82)" }}
                      >
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar className="h-4 w-4" aria-hidden="true" />
                          {post.date}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Clock className="h-4 w-4" aria-hidden="true" />
                          {post.readingTime || "5 分钟"}
                        </span>
                      </div>
                      <h1
                        className="mt-3 text-2xl md:text-3xl font-semibold leading-tight"
                        style={{ color: "var(--accent-foreground)" }}
                      >
                        {post.title}
                      </h1>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {post.tags.map((t) => (
                          <span
                            key={t}
                            className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium"
                            style={{
                              color: "var(--accent-foreground)",
                              borderColor: "rgba(255,255,255,0.22)",
                              background: "rgba(255,255,255,0.10)",
                              backdropFilter: "blur(8px)",
                            }}
                          >
                            <Tag className="h-3.5 w-3.5" aria-hidden="true" />
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </header>

              <div className="p-4 pt-8 md:p-6 md:pt-8">
                <MarkdownContent html={html} />
              </div>

              <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
              />
            </article>

            <section>
              <div className="flex items-end justify-between gap-4">
                <h2 className="text-xl font-semibold">相关文章</h2>
              </div>
              <div className="mt-4 grid auto-rows-fr gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-5">
                {related.map((p) => (
                  <PostCard key={p.slug} post={p} compact />
                ))}
              </div>
            </section>

          </div>

          <aside className="hidden lg:block w-[320px] shrink-0">
            <div className="sticky top-[7.5rem] space-y-4">
              <TableOfContents toc={toc} />

              <section
                className="overflow-hidden rounded-[1.5rem] p-5"
                style={{
                  background:
                    "linear-gradient(135deg, #071226 0%, #0B1830 38%, #1F2937 100%)",
                  boxShadow:
                    "0 26px 90px color-mix(in oklab, var(--accent) 14%, transparent)",
                }}
              >
                <span
                  className="inline-flex rounded-full px-3 py-1 text-xs font-semibold text-accent-foreground"
                  style={{
                    background:
                      "linear-gradient(135deg, color-mix(in oklab, var(--accent) 88%, var(--background)), color-mix(in oklab, var(--accent-2) 82%, var(--accent)))",
                  }}
                >
                  官方推荐
                </span>
                <h2 className="mt-5 text-[1.75rem] font-semibold leading-tight text-white">
                  开始使用 iTick API
                </h2>
                <p className="mt-4 text-sm leading-7 text-white/78">
                  获取专业的实时行情与历史数据接口，支持股票、期货、外汇等多种金融产品。
                  稳定、低延迟、易接入。
                </p>
                <a
                  href="https://itick.org/zh-cn"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-[1rem] px-5 py-4 text-base font-semibold text-accent-foreground transition-transform hover:-translate-y-0.5"
                  style={{
                    background:
                      "linear-gradient(135deg, color-mix(in oklab, var(--accent) 92%, var(--background)), color-mix(in oklab, var(--accent-2) 88%, var(--accent)))",
                    boxShadow:
                      "0 18px 40px color-mix(in oklab, var(--accent) 36%, transparent)",
                  }}
                >
                  立即注册获取免费 API KEY
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                </a>
                <a
                  href="https://docs.itick.org/zh-cn"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-2 text-sm text-white/72 transition-colors hover:text-white"
                >
                  查看 API 文档
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              </section>
            </div>
          </aside>
        </div>

        <nav className="mt-10 grid gap-4 sm:grid-cols-2">
          {prev ? (
            <Link
              href={`/posts/${prev.slug}`}
              className="rounded-2xl border p-4"
              style={{
                borderColor: "var(--border)",
                background: "var(--card)",
              }}
            >
              <div className="text-xs" style={{ color: "var(--muted)" }}>
                上一篇
              </div>
              <div className="mt-1 text-sm font-semibold">{prev.title}</div>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              href={`/posts/${next.slug}`}
              className="rounded-2xl border p-4"
              style={{
                borderColor: "var(--border)",
                background: "var(--card)",
              }}
            >
              <div className="text-xs" style={{ color: "var(--muted)" }}>
                下一篇
              </div>
              <div className="mt-1 text-sm font-semibold">{next.title}</div>
            </Link>
          ) : (
            <span />
          )}
        </nav>
      </div>
    </div>
  );
}
