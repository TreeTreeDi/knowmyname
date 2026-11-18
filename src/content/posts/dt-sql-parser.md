---
title: 深入 dt-sql-parser 源码：如何在前端实现 SQL 解析和补全
date: 2025-11-19
minutes: 15
sample: true
---

在浏览器里做 SQL 补全，核心是两件事：把 SQL 解析成语法树，再根据光标位置推断「这里能写什么」。

## 从 ANTLR4 语法开始

dt-sql-parser 用 ANTLR4 为不同方言生成词法和语法分析器。

## 补全

```ts
const parser = new FlinkSQL();
const suggestions = parser.getSuggestionAtCaretPosition(sql, { lineNumber: 1, column: 10 });
```

## 性能

大文件只解析光标附近的语句，避免每次按键都解析全文。
