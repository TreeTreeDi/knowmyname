---
title: 从 TFT & TTI 出发的前端分包理解：CJS&ESM、Vite 与 React Router 相关
date: 2025-11-11T19:00:00+08:00
minutes: 25
sample: true
---

分包不是为了包更小，而是为了首屏更早可交互。先看指标，再谈拆法。

## 两个指标

- **TFT**：首个有意义的内容出现。
- **TTI**：页面可以稳定响应输入。

## 拆在路由边界

```ts
const Settings = lazy(() => import('./routes/settings'));
```

## CJS 与 ESM

只有 ESM 能被可靠地 tree-shake，混用时要留意依赖的导出格式。
