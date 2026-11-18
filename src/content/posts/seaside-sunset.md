---
title: 日落是 16:55：给博客造一片跟着北京时间变色的海
date: 2026-11-18
minutes: 6
sample: true
---

十一月中旬的上海，日落在 16:55 前后。首页顶上那条海，就是照着这个时间变色的。

## 从官方示例开始

海面来自 three.js 的 `webgpu_ocean` 示例：`WaterMesh` 加 `SkyMesh`，再叠一层很轻的 bloom。浏览器支持 WebGPU 就直接用，不支持就退回 WebGL 2，再不行就是一张静态截图。

```ts
const renderer = new THREE.WebGPURenderer({ forceWebGL: !('gpu' in navigator) });
await renderer.init();
```

## 四组参数

一天切成清晨、正午、日落、夜晚。每段一组参数：太阳高度、方位、浑浊度、海水颜色、曝光。切换时不跳变，而是在一秒多里慢慢插值过去。

## 不打扰阅读

- 滚出视口、切到别的标签页，渲染就停。
- 系统开了「减少动态效果」，只显示静态图。
- 文章页不加载它。
