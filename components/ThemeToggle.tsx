"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const current = theme === "system" ? resolvedTheme : theme;
  const isDark = current === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="inline-flex items-center justify-center rounded-full border px-3 py-2 text-sm transition-colors"
      style={{ borderColor: "var(--border)" }}
      aria-label={mounted ? (isDark ? "切换到亮色" : "切换到暗色") : "切换主题"}
    >
      {mounted ? (
        isDark ? (
          <Sun className="h-[18px] w-[18px]" aria-hidden="true" />
        ) : (
          <Moon className="h-[18px] w-[18px]" aria-hidden="true" />
        )
      ) : (
        <span className="w-[18px] h-[18px]" />
      )}
    </button>
  );
}
