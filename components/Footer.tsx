import Link from "next/link";

export function Footer() {
  return (
    <footer
      className="border-t mt-16"
      style={{ borderColor: "var(--border)" }}
    >
      <div className="py-10">
        <div
          className="relative w-full overflow-hidden px-6 py-10 md:px-12 md:py-14"
          style={{
            background:
              "radial-gradient(1100px 360px at 15% 0%, var(--surface-glow), transparent 60%), radial-gradient(900px 340px at 85% 20%, var(--surface-glow-2), transparent 55%), var(--card)",
            boxShadow:
              "0 40px 120px color-mix(in oklab, var(--accent) 10%, transparent)",
          }}
        >
          <div className="container grid gap-10 md:grid-cols-3">
            <div className="flex flex-col gap-3">
              <Link
                href="/"
                className="font-semibold"
                style={{ color: "var(--foreground)" }}
              >
                TradingView 图表开发教程
              </Link>
              <p className="text-sm" style={{ color: "var(--muted)" }}>
                聚焦 TradingView Charting Library 集成与数据源对接，所有示例数据均以
                iTick API 为基准，帮助你快速构建可用的行情图表应用。
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <div className="text-sm font-semibold">快速导航</div>
              <Link
                href="/"
                className="text-sm transition-colors hover:text-foreground"
                style={{ color: "var(--muted)" }}
              >
                首页
              </Link>
              <Link
                href="/blogs"
                className="text-sm transition-colors hover:text-foreground"
                style={{ color: "var(--muted)" }}
              >
                博客列表
              </Link>
            </div>

            <div className="flex flex-col gap-2">
              <div className="text-sm font-semibold">友情链接</div>
              <a
                href="https://itick.org/zh-cn"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm transition-colors hover:text-foreground"
                style={{ color: "var(--muted)" }}
              >
                iTick 官网
              </a>
              <a
                href="https://iquant.blog/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm transition-colors hover:text-foreground"
                style={{ color: "var(--muted)" }}
              >
                金融知识库
              </a>
              <a
                href="https://mtick.iquant.blog/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm transition-colors hover:text-foreground"
                style={{ color: "var(--muted)" }}
              >
                码上行情
              </a>
            </div>
          </div>
        </div>
      </div>
      <div
        className="container py-6 text-xs"
        style={{ color: "var(--muted)" }}
      >
        Copyright © {new Date().getFullYear()} TradingView 图表开发教程
      </div>
    </footer>
  );
}
