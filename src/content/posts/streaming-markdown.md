---
title: streaming-markdown 三层 Memoization，Markdown 优化渲染速度
date: 2025-11-11T18:00:00+08:00
minutes: 8
sample: true
---

流式输出时，Markdown 每来一个字都要重新渲染。三层缓存让大部分工作只做一次。

## 三层

1. **块级**：已经闭合的段落不再重新解析。
2. **节点级**：同一个 AST 节点复用同一个 React 元素。
3. **高亮级**：代码块按内容哈希缓存高亮结果。

```ts
const html = cache.get(hash(code)) ?? highlight(code);
```
