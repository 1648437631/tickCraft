"use client";

import { useEffect, useRef } from "react";

export function MarkdownContent({ html }: { html: string }) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const onClick = async (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const btn = target.closest<HTMLButtonElement>(".codeblock__copy");
      if (!btn) return;

      const wrapper = btn.closest<HTMLElement>(".codeblock");
      const pre = wrapper?.querySelector("pre");
      if (!pre) return;

      const code = pre.textContent ?? "";
      try {
        await navigator.clipboard.writeText(code);
        const old = btn.textContent;
        btn.textContent = "已复制";
        window.setTimeout(() => {
          btn.textContent = old ?? "复制";
        }, 1200);
      } catch {
        const old = btn.textContent;
        btn.textContent = "复制失败";
        window.setTimeout(() => {
          btn.textContent = old ?? "复制";
        }, 1200);
      }
    };

    root.addEventListener("click", onClick);
    return () => root.removeEventListener("click", onClick);
  }, []);

  return (
    <div
      ref={ref}
      className="prose"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

