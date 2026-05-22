import Image from "next/image";
import Link from "next/link";
import { Calendar, Clock, Sparkles, Tag } from "lucide-react";
import type { PostMeta } from "@/lib/posts";

export function PostCard({
  post,
  featuredBadge,
  compact,
}: {
  post: PostMeta;
  featuredBadge?: boolean;
  compact?: boolean;
}) {
  const tags = post.tags.slice(0, 3);

  return (
    <article
      className={`group relative h-full overflow-hidden border border-border bg-card transition-all hover:-translate-y-1 hover:shadow-xl ${
        compact ? "rounded-[1rem]" : "rounded-[1.25rem]"
      }`}
    >
      <Link href={`/posts/${post.slug}`} className="flex h-full flex-col">
        <div className="relative aspect-[16/9] w-full overflow-hidden">
          <Image
            src={`/images/${post.coverImage}`}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
            priority={post.featured === true}
          />
          {featuredBadge ? (
            <div className="absolute top-3 left-3">
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold text-accent-foreground shadow-sm"
                style={{
                  background:
                    "linear-gradient(135deg, var(--accent), var(--accent-2))",
                }}
              >
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                精选文章
              </span>
            </div>
          ) : null}
          {compact ? null : (
            <div className="absolute inset-x-0 bottom-0 z-10 p-3 md:p-4">
              <div className="flex flex-wrap gap-2">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] font-medium text-accent-foreground backdrop-blur-sm"
                    style={{
                      borderColor:
                        "color-mix(in oklab, var(--accent) 30%, rgba(255,255,255,0.18))",
                      background:
                        "linear-gradient(135deg, color-mix(in oklab, var(--accent) 28%, transparent), color-mix(in oklab, var(--accent-2) 24%, transparent))",
                      boxShadow:
                        "inset 0 1px 0 rgba(255,255,255,0.12), 0 8px 24px color-mix(in oklab, var(--accent) 18%, transparent)",
                    }}
                  >
                    <Tag className="h-3.5 w-3.5" aria-hidden="true" />
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div
          className={`flex flex-1 flex-col ${
            compact
              ? "px-3.5 pt-3.5 pb-3 md:px-4 md:pt-4 md:pb-3.5"
              : "px-4 pt-4 pb-3 md:px-5 md:pt-5 md:pb-4"
          }`}
        >
          <h3
            className={`font-semibold leading-snug text-foreground transition-colors group-hover:text-accent line-clamp-2 ${
              compact ? "text-sm" : "text-lg md:text-xl"
            }`}
          >
            {post.title}
          </h3>
          {compact ? null : (
            <>
              <p className="mt-2 text-sm leading-relaxed text-muted line-clamp-2">
                {post.description}
              </p>

              <div className="mt-4 flex items-center gap-4 text-xs text-muted-2">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                  {post.date}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                  {post.readingTime || "5 分钟"}
                </span>
              </div>
            </>
          )}
        </div>
      </Link>
    </article>
  );
}
