# TradingView 图表开发教程博客

一个以「TradingView 交易图表开发教程」为核心内容的静态技术博客，支持亮/暗主题切换，文章内容基于 `content/posts` 下的 Markdown 文件生成，并提供分页、目录（TOC）、上一篇/下一篇、相关文章、sitemap 与 robots。

## 环境要求

- Node.js 20+

## 安装依赖

```bash
npm install
```

## 生成文章与封面图（40 篇）

脚本会：

- 在 `content/posts` 下生成 40 篇 Markdown 文章（每篇正文约 5000 汉字）
- 从 Unsplash 获取封面图并用 `sharp` 转为 WebP（尽量控制 ≤ 30KB）
- 同步图片到 `content/images` 与 `public/images`

```bash
npm run generate:content
```

## 本地运行

```bash
npm run dev
```

打开 http://localhost:3000

## 构建

```bash
npm run build
npm run start
```

## 环境变量

在生产环境建议设置站点 URL，用于生成正确的 canonical 与 Open Graph：

- `NEXT_PUBLIC_SITE_URL`：例如 `https://your-domain.com`

说明：

- 文章内涉及 iTick API 的示例代码使用 token 鉴权头字段，具体接口与基准 URL 参考：https://docs.itick.org/api-url.md
- 实际项目中请不要把 iTick Token 暴露在浏览器端
