import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export function Breadcrumbs({
  items,
  action,
}: {
  items: Array<{ label: string; href?: string }>;
  action?: { label: string; href: string };
}) {
  if (!items.length) return null;

  return (
    <nav
      aria-label="面包屑"
      className="sticky top-16 z-40 border-b backdrop-blur"
      style={{
        borderColor: "var(--border)",
        background: "color-mix(in oklab, var(--background) 80%, transparent)",
      }}
    >
      <div className="container py-3 flex items-center justify-between gap-4">
        <ol className="flex min-w-0 flex-wrap items-center gap-2 text-sm text-muted">
          {items.map((item, i) => {
            const last = i === items.length - 1;
            const content =
              item.href && !last ? (
                <Link
                  href={item.href}
                  className="inline-flex items-center gap-2 transition-colors hover:text-foreground"
                >
                  {i === 0 ? <Home className="h-4 w-4" aria-hidden="true" /> : null}
                  <span className="truncate">{item.label}</span>
                </Link>
              ) : (
                <span className="inline-flex items-center gap-2 text-foreground font-medium min-w-0">
                  {i === 0 ? <Home className="h-4 w-4" aria-hidden="true" /> : null}
                  <span className="truncate">{item.label}</span>
                </span>
              );

            return (
              <li
                key={`${item.label}-${i}`}
                className="inline-flex items-center gap-2 min-w-0"
              >
                {content}
                {!last ? (
                  <ChevronRight
                    className="h-4 w-4 text-muted-2 shrink-0"
                    aria-hidden="true"
                  />
                ) : null}
              </li>
            );
          })}
        </ol>

        {action ? (
          <Link
            href={action.href}
            className="shrink-0 text-sm font-medium transition-colors hover:text-foreground"
            style={{ color: "var(--muted)" }}
          >
            {action.label}
          </Link>
        ) : null}
      </div>
    </nav>
  );
}
