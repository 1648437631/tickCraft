---
title: "集成 iTick 实时数据源：自定义 Datafeed 详解"
date: "2025-04-23"
description: "围绕 subscribeBars 的职责、轮询与推送的取舍、最后一根 K 线合并策略，详细说明如何把 iTick 的实时数据稳定接到 TradingView 自定义 datafeed 中。"
tags: ["TradingView","iTick","Datafeed"]
coverImage: "itick-realtime-datafeed.webp"
featured: true
---

## 1. 实时图表真正难的不是“有数据”，而是“最后一根稳定”

很多项目在演示阶段都会说自己已经接入了实时行情，因为页面上数字会动、K 线也会刷新。但真正进入产品阶段之后，团队最先遇到的问题往往不是“完全没有实时数据”，而是“最后一根 K 线反复跳动”“切换周期后数据对不上”“重新连接后出现重复柱子”。这些问题的根源，都在于 `subscribeBars` 并不只是把一条条报价往图表里塞进去那么简单，它本质上是在维护一根正在形成中的 bar。

只要你在这一步没有理解清楚实时链路的职责，后面几乎一定会出现边界错乱。TradingView 期望的是一个连续、单调、时间边界清晰的序列；而 iTick 给你的可能是逐笔成交、报价更新或者一段最新 K 线数据。如何把这些事件整理成图表可以安全消费的最后一根 bar，这才是实时 datafeed 的核心工作。

如果你准备把这套逻辑用于真实项目，建议先阅读 iTick 官网 https://itick.org/zh-cn 和文档 https://docs.itick.org/zh-cn ，确认自己当前可用的是哪种实时能力。对多数团队来说，第一版完全可以先用服务端轮询最新 K 线来模拟实时更新，把协议和图表边界调通之后，再进一步升级成 WebSocket。这样迭代速度更快，问题也更容易收敛。

## 2. subscribeBars 到底负责什么

`subscribeBars` 不是单纯的“订阅接口”。在 TradingView 的世界里，它有三个明确职责。第一，维持某个 symbol 加某个 resolution 的订阅状态。第二，把最新事件合并成最后一根 bar。第三，在取消订阅时及时释放资源，避免页面里残留多个定时器或连接。

很多人把历史数据逻辑写得很认真，却在实时部分偷懒，直接收到什么就推什么。结果就是图表可能在一分钟周期里每几秒钟新开一根 bar，或者在周期切换后继续沿用旧的订阅。要避免这些问题，你必须在本地保存“上一根已知 bar”，并根据当前 resolution 判断新事件到底属于当前 bar，还是应该开启下一根 bar。

另一个经常被忽略的点是：实时链路和历史链路必须使用同一套 symbol 语义和时间语义。也就是说，`getBars` 返回的最后一根 bar 和 `subscribeBars` 后续更新的那一根 bar，必须在时间戳上能无缝衔接。否则你就会看到图表偶发性回退、抖动或者重复开柱。

## 3. 为什么第一版建议先用服务端轮询最新 K 线

看到“实时”二字，很多人第一反应就是直接上 WebSocket。方向没错，但对第一版教程或中小团队项目来说，最值得优先完成的，其实是“正确性”，而不是“连接方式的先进性”。因为一套不正确的 WebSocket 推送，排查起来远比一套正确的轮询方案更难。

使用 iTick 时，你完全可以先通过服务端轮询最新一到两根 K 线，生成一个稳定的 `/api/itick/realtime-bar` 接口，再由前端 `subscribeBars` 定时拉取。这样做虽然不是最终形态，却能非常有效地帮助你验证三件事：周期映射是否正确，最后一根 bar 的合并规则是否正确，以及断开重连后是否能继续从正确位置更新。

只要这三件事被验证过，后续把轮询改成 WebSocket，只是把“数据到达方式”替换掉，而不是推翻整套合并逻辑。这个分阶段策略在真实项目里非常有价值，因为它能让你先把图表行为调对，再去优化实时性。

## 4. 用 iTick 服务端接口提供最新 bar

下面这个 Route Handler 示例展示了一个实用做法：服务端每次请求 iTick 最新两根 K 线，然后把最后一根返回给前端订阅逻辑。之所以取两根而不是一根，是因为很多时候你需要用前一根来判断边界是否切换，或者在某些市场里校验最后一根是否已经变成下一周期。

```ts
import { NextRequest } from "next/server";

const ITICK_BASE = process.env.ITICK_BASE_URL ?? "https://api.itick.org";
const ITICK_TOKEN = process.env.ITICK_TOKEN!;

const resolutionMap: Record<string, string> = {
  "1": "1",
  "5": "5",
  "15": "15",
  "60": "60",
  D: "101",
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get("symbol") ?? "BTCUSDT";
  const resolution = searchParams.get("resolution") ?? "1";

  const upstream = new URL(`${ITICK_BASE}/crypto/kline`);
  upstream.searchParams.set("region", "US");
  upstream.searchParams.set("code", symbol);
  upstream.searchParams.set("kType", resolutionMap[resolution] ?? "1");
  upstream.searchParams.set("limit", "2");

  const res = await fetch(upstream, {
    headers: {
      accept: "application/json",
      token: ITICK_TOKEN,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    return Response.json({ message: `iTick error: ${res.status}` }, { status: 500 });
  }

  const json = await res.json();
  const rows = json.data ?? [];
  const last = rows[rows.length - 1] ?? null;
  return Response.json({ bar: last });
}
```

这段代码的重点，不是它有多高级，而是它把浏览器和 iTick 之间隔出了一层你可控的服务端。今后你要做缓存、重试、限流、日志埋点或者环境切换，全部可以在这里处理，而不是在前端 datafeed 里写一堆难以维护的判断。

## 5. 在 subscribeBars 中维护最后一根 bar

有了服务端接口之后，就可以在 `subscribeBars` 里维护当前订阅状态了。这里一定要记住：前端维护的是“图表当前最后一根 bar 的状态”，不是一串离散事件。每次轮询拿到最新值时，你要先判断它的时间是否与上一根 bar 相同；相同就更新同一根，不同才开启下一根。只有这样，图表才会表现得像一个连续时间序列。

```ts
type Bar = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
};

const subscriptions = new Map<string, number>();
const lastBars = new Map<string, Bar>();

function mapITickBar(row: { t: number; o: number; h: number; l: number; c: number; v?: number }): Bar {
  return {
    time: row.t,
    open: row.o,
    high: row.h,
    low: row.l,
    close: row.c,
    volume: row.v,
  };
}

export function subscribeBars(
  symbolInfo: { ticker: string },
  resolution: string,
  onRealtimeCallback: (bar: Bar) => void,
  subscriberUID: string,
) {
  const poll = async () => {
    const url = new URL("/api/itick/realtime-bar", window.location.origin);
    url.searchParams.set("symbol", symbolInfo.ticker);
    url.searchParams.set("resolution", resolution);

    const res = await fetch(url, { headers: { accept: "application/json" } });
    const json = await res.json();
    if (!json.bar) return;

    const nextBar = mapITickBar(json.bar);
    const lastBar = lastBars.get(subscriberUID);

    if (!lastBar || lastBar.time !== nextBar.time) {
      lastBars.set(subscriberUID, nextBar);
      onRealtimeCallback(nextBar);
      return;
    }

    const merged = {
      ...lastBar,
      high: Math.max(lastBar.high, nextBar.high),
      low: Math.min(lastBar.low, nextBar.low),
      close: nextBar.close,
      volume: nextBar.volume,
    };

    lastBars.set(subscriberUID, merged);
    onRealtimeCallback(merged);
  };

  poll();
  const timer = window.setInterval(poll, 2000);
  subscriptions.set(subscriberUID, timer);
}

export function unsubscribeBars(subscriberUID: string) {
  const timer = subscriptions.get(subscriberUID);
  if (timer) window.clearInterval(timer);
  subscriptions.delete(subscriberUID);
  lastBars.delete(subscriberUID);
}
```

这段代码体现了实时 datafeed 最核心的一点：**图表只关心最新状态，不关心你内部收到过多少次事件**。你可以把上游换成 iTick WebSocket，也可以继续保留轮询，但只要 `nextBar` 和 `lastBar` 的合并逻辑不变，图表行为就是可控的。

## 6. 什么时候该从轮询升级到 WebSocket

当你的页面上同时存在多个图表、多个 symbol，或者用户对延迟要求明显提高时，轮询的局限就会开始暴露。这时候最合适的升级路径不是重写整个 datafeed，而是把“获得最新 bar 的来源”从轮询换成推送。也就是说，订阅表、最后一根 bar 的合并逻辑和 `onRealtimeCallback` 的调用方式，应该尽量保持不变。

你可以把服务端作为统一实时网关，由服务端连接 iTick 的实时能力，再把处理过的事件分发给前端。这种做法虽然实现成本更高，但在多标签页、多图表和权限控制场景下更稳定。尤其当你准备做交易终端级别的产品时，把所有浏览器都直接连到上游并不是一个理想结构。

不管你最终是轮询还是推送，都建议把“时间边界的归并规则”写成独立函数。因为这部分逻辑往往是整个实时 datafeed 最容易被修改、也最容易引入回归错误的地方。一旦后面加入盘前盘后、夜盘或特殊市场时段，你会非常庆幸自己没有把所有判断散落在回调里。

## 7. 实时图表最常见的故障现象与排查顺序

如果你发现最后一根 K 线不停开新柱，第一步检查的不是上游有没有返回数据，而是检查 resolution 对应的周期时间是否算错。很多时候，问题只是你把“下一分钟开始的时间”误判成“当前分钟正在更新的时间”。如果你发现最后一根价格会回退，则优先检查历史接口的最后一根与实时接口的第一根是不是同一根 bar，以及时区是否一致。

如果你发现切换页面后 CPU 占用越来越高，很可能是 `unsubscribeBars` 没有真正清理定时器或连接。这个问题在 React 项目里尤其常见，因为组件卸载、重新挂载和 symbol 切换非常频繁。排查这类问题时，不妨把当前订阅表打印出来，确认每个订阅 UID 是否真的只有一个活动实例。

最后再提醒一个很容易忽略的细节：不要把错误直接吞掉。无论是轮询接口失败、iTick 返回异常码，还是 JSON 结构发生变化，都应该在服务端和前端各保留一层日志。实时链路的问题之所以难排查，正是因为它们大多发生在“偶发”和“边界”场景里。没有足够的日志，就很难回放现场。

## 8. 小结

把 iTick 实时数据接入 TradingView，并不意味着你必须第一天就把 WebSocket、重连、心跳和多路复用全部做好。更实际的路径是先通过服务端轮询建立一套正确的最后一根 bar 合并逻辑，再逐步升级到更复杂的实时方案。

只要你记住一条主线：TradingView 只接受稳定、连续、边界明确的 bar 序列，那么无论你的上游是 iTick REST 轮询还是更高阶的推送通道，最终都能收敛成一套可维护的 datafeed。建议后续继续结合 https://itick.org/zh-cn 与 https://docs.itick.org/zh-cn 做更细的接口对照，把实时能力一步一步从“能动”打磨到“稳定可靠”。

## 9. 多图表与多标签页场景下的实时管理

一旦页面里不止一个图表，实时链路的问题就会被成倍放大。最常见的表现是多个图表分别建立自己的轮询或连接，结果同一个 symbol 的最新数据被重复请求，既浪费资源，也增加了状态错乱的概率。因此，实时 datafeed 最好尽早建立“订阅注册表”的概念，让相同 symbol 与相同周期的订阅可以被复用。

如果你后面还要做多标签页同步，这套注册表会更有价值。因为浏览器中的多个标签页可能同时盯着同一标的，这时候如果每个页面都直接拉 iTick，上游压力会快速变大。更好的方向是把订阅集中到服务端或共享层，再把处理后的结果分发出去。这样做不仅更稳，也更接近真实交易终端的架构方式。

## 10. 何时应该记录实时日志

实时链路和历史链路最大的不同，在于很多问题并不会稳定复现。你今天看到最后一根 K 线偶尔抖动，明天再刷新页面却可能一切正常。面对这种问题，没有日志几乎等于没有证据。因此，建议从第一版开始就在实时链路里记录订阅开始时间、symbol、resolution、最近一次 bar 更新时间以及异常响应。

日志不需要复杂，但一定要能帮助你回答几个核心问题：当前到底订阅了谁、最后一次收到的 bar 时间是多少、当前这根 bar 是更新还是新开、取消订阅有没有执行。只要这些关键信息能被追踪，绝大多数实时故障都能被迅速缩小范围。
