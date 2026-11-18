---
title: Claude Code Hooks：长期检查 AI 代码生成的 TypeScript 错误
date: 2025-11-11T20:00:00+08:00
minutes: 12
sample: true
---

让 Agent 写代码很快，让它写出能通过类型检查的代码，需要一点约束。

## 思路

在每次编辑之后跑一次增量的 `tsc`，把错误原样喂回去。

```json
{ "hooks": { "PostToolUse": [{ "matcher": "Edit|Write", "command": "pnpm tsc --noEmit --incremental" }] } }
```

## 注意

只检查改动涉及的项目，避免大仓库里每次都全量检查。
