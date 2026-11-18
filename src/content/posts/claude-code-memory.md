---
title: Claude Code 记忆系统工程指南：CLAUDE.md 与 Auto Memory
date: 2026-02-20
minutes: 15
sample: true
---

每次打开 Claude Code，面对的都是一个全新的上下文窗口。项目约定、踩过的坑，如果不写下来，下一次就要重新解释一遍。

## 两种记忆

- **CLAUDE.md**：人写给 Agent 的规范，随仓库走。
- **Auto Memory**：Agent 自己记下的工作笔记。

## 放在哪里

```text
~/.claude/CLAUDE.md        # 个人
<repo>/CLAUDE.md           # 项目
<repo>/packages/x/CLAUDE.md  # 子目录，按需加载
```

## 生命周期

规范要短、要稳定；笔记可以多，但要定期清理。
