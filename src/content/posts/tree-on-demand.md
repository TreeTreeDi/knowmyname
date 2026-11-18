---
title: 为什么我在 Tree 组件放弃“每次重建”，在复杂场景改用“按需渲染”
date: 2025-11-11T16:00:00+08:00
minutes: 15
sample: true
---

小数据量时，每次重建整棵树最简单；节点上万时，它就成了瓶颈。

## 按需渲染

只为展开的节点创建子节点，配合虚拟滚动只渲染可见区域。

```ts
const visible = flatten(tree, expanded).slice(start, end);
```

## 代价

状态要从「树」挪到「展开集合」里，增删节点时需要额外维护索引。
