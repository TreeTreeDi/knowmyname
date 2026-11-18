---
title: 拾遗：React 设计 从批处理到 useTransition
date: 2025-11-13
minutes: 10
sample: true
---

React 18 之后，几乎所有更新都会被自动批处理。理解这一点，是理解 `useTransition` 的前提。

## 自动批处理

同一个事件循环里的多次 `setState`，只会触发一次渲染。

## 优先级

```tsx
const [isPending, startTransition] = useTransition();
startTransition(() => setQuery(next));
```

被包进 transition 的更新可以被打断，输入框始终保持跟手。
