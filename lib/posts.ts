import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export type PostFrontmatter = {
  title: string;
  date: string;
  description: string;
  tags: string[];
  coverImage: string;
  featured?: boolean;
};

export type PostMeta = PostFrontmatter & {
  slug: string;
  readingTime: string;
};

export type Post = PostMeta & {
  content: string;
};

const POSTS_DIR = path.join(process.cwd(), "content", "posts");

function ensurePostsDir() {
  if (!fs.existsSync(POSTS_DIR)) fs.mkdirSync(POSTS_DIR, { recursive: true });
}

function getSlugFromFilename(filename: string) {
  return filename.replace(/\.mdx?$/, "");
}

export function getAllPostSlugs() {
  ensurePostsDir();
  const files = fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith(".md") || f.endsWith(".mdx"));

  return files.map(getSlugFromFilename);
}

export function getPostBySlug(slug: string): Post {
  ensurePostsDir();
  const fullPathMd = path.join(POSTS_DIR, `${slug}.md`);
  const fullPathMdx = path.join(POSTS_DIR, `${slug}.mdx`);

  const fullPath = fs.existsSync(fullPathMd)
    ? fullPathMd
    : fs.existsSync(fullPathMdx)
      ? fullPathMdx
      : null;

  if (!fullPath) {
    throw new Error(`Post not found: ${slug}`);
  }

  const raw = fs.readFileSync(fullPath, "utf8");
  const parsed = matter(raw);
  const data = parsed.data as Partial<PostFrontmatter>;

  if (
    !data.title ||
    !data.date ||
    !data.description ||
    !data.tags ||
    !data.coverImage
  ) {
    throw new Error(`Invalid frontmatter: ${slug}`);
  }

  const readingTime = Math.ceil(parsed.content.length / 400) + " 分钟";

  return {
    slug,
    title: data.title,
    date: data.date,
    description: data.description,
    tags: data.tags,
    coverImage: data.coverImage,
    featured: data.featured,
    readingTime,
    content: parsed.content,
  };
}

export function getAllPosts(): PostMeta[] {
  const posts = getAllPostSlugs().map((slug) => {
    const { content: _content, ...meta } = getPostBySlug(slug);
    return meta;
  });

  return posts.sort((a, b) => (a.date > b.date ? -1 : 1));
}

export function getPostsPage(page: number, pageSize: number) {
  const all = getAllPosts();
  const total = all.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(Math.max(1, page), pageCount);
  const start = (current - 1) * pageSize;
  const end = start + pageSize;
  return {
    page: current,
    pageCount,
    total,
    items: all.slice(start, end),
  };
}

export function getPrevNext(slug: string) {
  const all = getAllPosts();
  const idx = all.findIndex((p) => p.slug === slug);
  if (idx < 0) return { prev: null, next: null };

  const next = idx > 0 ? all[idx - 1] : null;
  const prev = idx < all.length - 1 ? all[idx + 1] : null;
  return { prev, next };
}

export function getRelatedPosts(slug: string, limit: number) {
  const all = getAllPosts();
  const current = all.find((p) => p.slug === slug);
  if (!current) return [];

  const byScore = all
    .filter((p) => p.slug !== slug)
    .map((p) => {
      const overlap = p.tags.filter((t) => current.tags.includes(t)).length;
      return { p, score: overlap };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || (a.p.date > b.p.date ? -1 : 1))
    .slice(0, limit)
    .map((x) => x.p);

  if (byScore.length >= limit) return byScore;

  const fallback = all
    .filter((p) => p.slug !== slug && !byScore.find((x) => x.slug === p.slug))
    .slice(0, limit - byScore.length);

  return [...byScore, ...fallback];
}

