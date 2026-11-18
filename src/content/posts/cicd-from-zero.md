---
title: 从 0 到 1 体验 CI/CD
date: 2024-11-10
minutes: 8
sample: true
---

第一次给个人项目接上 CI/CD，最大的收获是：每次推送都有人替你把关。

## 最小流水线

```yaml
on: push
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pnpm install && pnpm build
```

## 之后

再加上预览部署，每个分支都有一个可以点开的地址。
