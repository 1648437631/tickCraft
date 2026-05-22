const DEFAULT_SITE_URL = "http://localhost:3000";

export const SITE_NAME = "TradingView 图表开发教程";
export const SITE_DESCRIPTION =
  "以 TradingView 交易图表开发为核心，系统讲解图表搭建、指标叠加、自定义 Datafeed、以及如何对接 iTick API 实时与历史行情数据。";

function normalizeSiteUrl(value?: string | null) {
  if (!value) return null;

  const trimmed = value.trim().replace(/\/+$/, "");
  if (!trimmed) return null;

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  if (trimmed.startsWith("localhost") || trimmed.startsWith("127.0.0.1")) {
    return `http://${trimmed}`;
  }

  return `https://${trimmed}`;
}

export function getSiteUrl() {
  return (
    normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL) ??
    normalizeSiteUrl(process.env.SITE_URL) ??
    normalizeSiteUrl(process.env.HOST) ??
    DEFAULT_SITE_URL
  );
}

export function absoluteUrl(path = "/") {
  return new URL(path, getSiteUrl()).toString();
}
