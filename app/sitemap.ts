import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/posts";
import { absoluteUrl } from "@/lib/site";

const PAGE_SIZE = 12;

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();
  const pageCount = Math.max(1, Math.ceil(posts.length / PAGE_SIZE));

  const items: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/blogs"), changeFrequency: "weekly", priority: 0.9 },
  ];

  for (let p = 2; p <= pageCount; p++) {
    items.push({
      url: absoluteUrl(`/blogs/page/${p}`),
      changeFrequency: "weekly",
      priority: 0.6,
    });
  }

  for (const post of posts) {
    items.push({
      url: absoluteUrl(`/posts/${post.slug}`),
      changeFrequency: "monthly",
      priority: 0.8,
      lastModified: post.date,
    });
  }

  return items;
}
