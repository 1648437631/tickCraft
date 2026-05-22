"use client";

import { useEffect, useState } from "react";
import type { TocItem } from "@/lib/markdown";

export function TableOfContents({
  toc,
}: {
  toc: TocItem[];
}) {
  const maxHeight = "clamp(12rem, calc(100vh - 31rem), 24rem)";
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    const ids = toc.map((item) => item.id);
    const headings = ids
      .map((id) => document.getElementById(id))
      .filter((node): node is HTMLElement => node instanceof HTMLElement);

    const updateFromHash = () => {
      const hash = window.location.hash.slice(1);
      if (hash) setActiveId(hash);
    };

    updateFromHash();
    window.addEventListener("hashchange", updateFromHash);

    if (headings.length === 0) {
      return () => window.removeEventListener("hashchange", updateFromHash);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible[0]?.target.id) {
          setActiveId(visible[0].target.id);
          return;
        }

        const passed = headings
          .filter((heading) => heading.getBoundingClientRect().top <= 140)
          .at(-1);

        if (passed?.id) {
          setActiveId(passed.id);
        }
      },
      {
        rootMargin: "-96px 0px -60% 0px",
        threshold: [0, 0.1, 0.5, 1],
      },
    );

    headings.forEach((heading) => observer.observe(heading));

    return () => {
      window.removeEventListener("hashchange", updateFromHash);
      observer.disconnect();
    };
  }, [toc]);

  if (toc.length === 0) return null;

  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background:
          "linear-gradient(180deg, color-mix(in oklab, var(--accent) 6%, var(--card)) 0%, var(--card) 100%)",
        boxShadow:
          "inset 0 1px 0 color-mix(in oklab, white 10%, transparent), 0 22px 80px color-mix(in oklab, var(--accent) 10%, transparent)",
      }}
    >
      <div
        className="text-sm font-semibold"
        style={{ color: "color-mix(in oklab, var(--accent) 82%, var(--foreground))" }}
      >
        文章目录
      </div>
      <div className="mt-3 overflow-hidden">
        <nav
          className="toc-scroll flex max-h-full flex-col gap-2 overflow-y-auto pr-1"
          style={{ maxHeight }}
        >
          {toc.map((item) => {
            const isActive = item.id === activeId;

            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                data-active={isActive}
                onClick={() => setActiveId(item.id)}
                className={`toc-link ${item.level === 3 ? "toc-link--nested" : ""}`}
              >
                {item.text}
              </a>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
