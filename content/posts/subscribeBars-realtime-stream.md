---
title: "subscribeBars 实时推送：用 iTick WebSocket 驱动图表更新"
date: "2025-12-31"
description: "围绕最后一根 K 线合并、订阅状态管理与 WebSocket 推送边界，系统说明如何把 iTick 实时数据稳定接入 TradingView subscribeBars。"
tags: ["TradingView","iTick","WebSocket"]
coverImage: "subscribeBars-realtime-stream.webp"
---

## 1. subscribeBars 的本质是维护“最后一根 bar”

很多人谈到 `subscribeBars`，第一反应就是“把实时数据推给图表”。这个理解不算错，但还远远不够。TradingView 真正需要的不是一堆离散事件，而是一条能够连续演化的 bar 序列。也就是说，`subscribeBars` 的核心工作不是转发事件，而是维护最后一根正在形成中的 bar，并在正确的时间点把它更新或替换。

如果你没有意识到这一点，实时链路往往会出现非常典型的问题：最后一根 K 线重复开柱、切换周期后更新错位、图表偶尔回退，或者多次订阅后状态越来越乱。所有这些表象，本质上都指向同一件事：订阅层没有把“实时事件”转换成“图表可消费的连续 bar 状态”。

## 2. 为什么推荐用服务端统一承接 iTick 实时能力

对于小型 demo，浏览器直接连接实时源有时也能工作。但一旦项目进入长期维护、多人协作或多图表场景，服务端统一承接实时能力会明显更稳。原因很现实：你可以把 token 留在服务端，可以集中处理重连与日志，可以统一把 iTick 的事件转换成内部标准结构，再分发给前端。

如果你准备认真做这条链路，建议先结合 https://itick.org/zh-cn 与 https://docs.itick.org/zh-cn 确认你当前可用的实时能力，再决定是先用轮询最新 K 线过渡，还是直接建立 WebSocket 网关。对多数项目来说，真正关键的不是连接方式有多先进，而是 bar 合并逻辑是否正确。

## 3. 实时链路里最容易搞错的边界是什么

实时更新最常见的误区，是把“每一条 tick 都当成一根新 bar”。这在逻辑上当然最省事，但图表会立刻变得不可信。因为对于分钟线、小时线甚至日线来说，大多数实时事件都只是当前周期内的增量更新，而不是下一根柱子的开始。只有在时间窗口真正跨过周期边界时，你才应该新开一根 bar。

因此，`subscribeBars` 的第一职责就是判断：这次收到的数据属于当前 bar，还是下一根 bar。只要这个判断错了，后面不管你怎么重连、怎么做心跳，图表行为都会一直有瑕疵。

## 4. 先定义统一的实时事件结构

来自 iTick 的实时事件，未必天然就是 TradingView 想要的 bars。为了让前后端职责清楚，最好在服务端先把实时事件整理成一套统一结构，例如 `barTime/open/high/low/close/volume`。这样前端的 `subscribeBars` 不再关心上游事件有多复杂，而只关心如何把它并入最后一根 bar。

一旦有了这层标准结构，你的前端逻辑就会轻很多。未来即使你把上游从轮询切成 WebSocket，前端大部分代码也不需要改，因为它消费的仍然是同一套内部标准事件。

## 5. 一个最小可用的订阅状态管理结构

真正可维护的实时系统，必须有订阅注册表。不要把定时器、socket 和最后一根 bar 分散放在多个组件局部变量里。更合理的方式是至少维护三张表：订阅对象表、最后一根 bar 表、symbol 与 resolution 的映射表。这样无论是新增订阅、清理订阅还是排查状态，你都有中心位置可以看。

```ts
type Bar = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
};

const subscriptions = new Map<string, WebSocket>();
const lastBars = new Map<string, Bar>();
const channels = new Map<string, { symbol: string; resolution: string }>();
```

这看起来只是几个 Map，但它们决定了你的实时链路是“可追踪的系统”，还是“能跑但越来越乱的脚本”。

## 6. 如何把实时事件合并成最后一根 bar

下面这个函数可以说是整个实时链路的中心。它接收上一根 bar 和当前实时事件，判断是更新当前 bar 还是开启下一根。只要这段逻辑写对，图表的实时表现通常就会稳定很多。

```ts
type RealtimeTick = {
  barTime: number;
  price: number;
  volume: number;
};

export function mergeRealtimeBar(lastBar: Bar | undefined, tick: RealtimeTick): Bar {
  if (!lastBar || tick.barTime > lastBar.time) {
    return {
      time: tick.barTime,
      open: tick.price,
      high: tick.price,
      low: tick.price,
      close: tick.price,
      volume: tick.volume,
    };
  }

  return {
    ...lastBar,
    high: Math.max(lastBar.high, tick.price),
    low: Math.min(lastBar.low, tick.price),
    close: tick.price,
    volume: (lastBar.volume ?? 0) + tick.volume,
  };
}
```

这里最值得强调的是：新开 bar 的条件不是“收到新消息”，而是 `tick.barTime` 已经跨入下一个周期。理解这一点之后，很多实时问题都会自然消失。

## 7. 一个更接近实战的 subscribeBars 写法

有了合并函数之后，`subscribeBars` 本身就会清晰很多。它要做的事情只有三件：建立连接、接收事件并更新最后一根 bar、在取消订阅时清理连接和缓存。下面这段代码展示的是一个典型结构。

```ts
export function subscribeBars(
  symbolInfo: { ticker: string },
  resolution: string,
  onRealtimeCallback: (bar: Bar) => void,
  subscriberUID: string,
) {
  const socket = new WebSocket(`wss://example.com/realtime?symbol=${symbolInfo.ticker}&resolution=${resolution}`);

  channels.set(subscriberUID, { symbol: symbolInfo.ticker, resolution });
  subscriptions.set(subscriberUID, socket);

  socket.onmessage = (event) => {
    const tick = JSON.parse(event.data) as RealtimeTick;
    const merged = mergeRealtimeBar(lastBars.get(subscriberUID), tick);
    lastBars.set(subscriberUID, merged);
    onRealtimeCallback(merged);
  };

  socket.onerror = () => {
    console.error("realtime socket error", subscriberUID);
  };
}

export function unsubscribeBars(subscriberUID: string) {
  const socket = subscriptions.get(subscriberUID);
  if (socket) socket.close();
  subscriptions.delete(subscriberUID);
  channels.delete(subscriberUID);
  lastBars.delete(subscriberUID);
}
```

这段代码不一定是你的最终形态，但它已经把最关键的边界展示出来了：状态集中、更新单向、清理明确。

## 8. 多图表和多标签页时必须考虑复用

一旦页面里出现多个图表，或者用户同时开了多个标签页，实时链路的问题会被快速放大。如果每个图表都单独连一条上游连接，不仅浪费资源，还会让同一个 symbol 的最后一根 bar 在多个地方分别维护，极易出现不一致。因此，只要项目稍微复杂一点，就应该考虑连接复用与分发机制。

比较理想的方式是让服务端或共享层持有真实订阅，再把整理后的标准实时事件分发给前端。这会让系统复杂一点，但可维护性会大幅提升。至少在你的教程和项目结构里，最好把这条路线作为明确的后续方向写清楚，而不是把浏览器直连当成唯一形态。

## 9. 实时链路最有效的排障顺序

实时问题往往不是持续稳定出现的，所以排障顺序特别重要。比较高效的顺序通常是：先看订阅是否真的建立；再看收到的事件里 `barTime` 是否正确；接着看 `mergeRealtimeBar` 的输入输出；最后再看图表回调是否被多次重复触发。只要按这条顺序排查，大多数“最后一根跳动”问题都能迅速收敛。

另外，建议你把关键日志固定下来：订阅开始、订阅结束、最后一根 bar 时间、每次收到的 `barTime`、以及重连是否发生。没有这些日志，实时问题通常只能靠猜；有了这些日志，问题就能被还原成明确的状态转换。

## 10. 小结

`subscribeBars` 看似只是实时推送接口，实际上它决定了图表最后一根 bar 是否可信。只要你把 iTick 的实时事件统一整理成标准结构，再通过清晰的订阅表和合并函数维护状态，TradingView 的实时表现就会稳定很多。

后续如果你继续增强这条链路，最值得优先投入的方向是连接复用、服务端统一网关和更完整的日志体系。这样你的实时图表就会从“会动”升级成“可靠可维护”。接口与数据能力仍建议继续对照 https://itick.org/zh-cn 与 https://docs.itick.org/zh-cn 逐步完善。
