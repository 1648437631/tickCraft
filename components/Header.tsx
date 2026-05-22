"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";

function Logo() {
  return (
    <Link href="/" className="inline-flex items-center gap-2 font-semibold">
      <span
        className="inline-flex h-8 w-8 items-center justify-center rounded-xl"
        style={{
          background:
            "linear-gradient(135deg, color-mix(in oklab, var(--accent) 88%, var(--accent-2)), color-mix(in oklab, var(--accent-2) 78%, var(--accent)))",
        }}
      >
        <span style={{ color: "var(--accent-foreground)" }}>TV</span>
      </span>
      <span className="hidden sm:inline">TradingView 图表开发</span>
    </Link>
  );
}

function NavLink({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={[
        "relative text-sm font-medium transition-colors",
        active
          ? "text-foreground after:absolute after:left-0 after:-bottom-2 after:h-[2px] after:w-full after:rounded-full after:bg-[linear-gradient(135deg,var(--accent),var(--accent-2))]"
          : "text-muted hover:text-foreground",
      ].join(" ")}
    >
      {label}
    </Link>
  );
}

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const active = useMemo(() => {
    if (!pathname) return "/";
    if (pathname.startsWith("/blogs")) return "/blogs";
    return "/";
  }, [pathname]);

  return (
    <header
      className="fixed inset-x-0 top-0 z-50 border-b backdrop-blur"
      style={{
        borderColor: "var(--border)",
        background: "color-mix(in oklab, var(--background) 75%, transparent)",
      }}
    >
      <div className="container h-16 flex items-center justify-between gap-4">
        <Logo />

        <nav className="hidden md:flex items-center gap-6">
          <NavLink href="/" label="首页" active={active === "/"} />
          <NavLink href="/blogs" label="博客" active={active === "/blogs"} />
        </nav>

        <div className="flex items-center gap-2">
          <a
            href="https://itick.org/zh-cn"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:inline-flex items-center justify-center rounded-full border px-4 py-2 text-sm font-semibold transition-all hover:-translate-y-0.5 hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)]"
            style={{
              color: "var(--accent-foreground)",
              borderColor: "color-mix(in oklab, var(--accent) 42%, var(--border))",
              background:
                "linear-gradient(135deg, color-mix(in oklab, var(--accent) 92%, var(--background)), color-mix(in oklab, var(--accent-2) 92%, var(--background)))",
              boxShadow:
                "0 0 0 1px color-mix(in oklab, var(--accent) 18%, transparent), 0 14px 30px var(--surface-glow)",
            }}
          >
            立即接入
          </a>
          <ThemeToggle />
          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center rounded-full border px-3 py-2 text-sm"
            style={{ borderColor: "var(--border)" }}
            aria-label="打开菜单"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="w-5 h-5 inline-flex flex-col justify-center gap-1">
              <span
                className="h-[2px] w-full rounded"
                style={{ background: "var(--foreground)" }}
              />
              <span
                className="h-[2px] w-full rounded"
                style={{ background: "var(--foreground)" }}
              />
              <span
                className="h-[2px] w-full rounded"
                style={{ background: "var(--foreground)" }}
              />
            </span>
          </button>
        </div>
      </div>

      {open ? (
        <div
          className="md:hidden border-t"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="container py-4 flex flex-col gap-3">
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className={[
                "relative text-sm font-medium transition-colors",
                active === "/"
                  ? "text-foreground after:absolute after:left-0 after:-bottom-2 after:h-[2px] after:w-full after:rounded-full after:bg-[linear-gradient(135deg,var(--accent),var(--accent-2))]"
                  : "text-muted hover:text-foreground",
              ].join(" ")}
            >
              首页
            </Link>
            <Link
              href="/blogs"
              onClick={() => setOpen(false)}
              className={[
                "relative text-sm font-medium transition-colors",
                active === "/blogs"
                  ? "text-foreground after:absolute after:left-0 after:-bottom-2 after:h-[2px] after:w-full after:rounded-full after:bg-[linear-gradient(135deg,var(--accent),var(--accent-2))]"
                  : "text-muted hover:text-foreground",
              ].join(" ")}
            >
              博客
            </Link>
            <a
              href="https://itick.org/zh-cn"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold inline-flex items-center justify-center rounded-full border px-4 py-2 transition-all hover:-translate-y-0.5 hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)]"
              style={{
                color: "var(--accent-foreground)",
                borderColor:
                  "color-mix(in oklab, var(--accent) 42%, var(--border))",
                background:
                  "linear-gradient(135deg, color-mix(in oklab, var(--accent) 92%, var(--background)), color-mix(in oklab, var(--accent-2) 92%, var(--background)))",
                boxShadow:
                  "0 0 0 1px color-mix(in oklab, var(--accent) 18%, transparent), 0 14px 30px var(--surface-glow)",
              }}
            >
              立即接入 iTick
            </a>
          </div>
        </div>
      ) : null}
    </header>
  );
}
