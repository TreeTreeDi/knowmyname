# 海边 · Shane 的博客

一个以文章为主的极简博客：文章（按年分组）、作品、生活三块。海只做氛围：首页顶部一条实时 WebGPU 海面，整站底色和字色跟着北京时间的清晨 / 正午 / 日落 / 夜晚变。

> 文章标题来自 Shane 的真实文章，**正文是示例占位**；生活页照片是 **AI 生成的示例图**。页脚有一个小小的「示例」标记。

## 运行

需要 Node 24（`.nvmrc`）。

```bash
pnpm install
pnpm dev          # http://localhost:4331
pnpm build        # 纯静态产物在 dist/
```

调试参数：`?time=dawn|noon|dusk|night`（本标签页内记住，`?time=auto` 恢复）、`?gl`（强制 WebGL2）、`?static`（不启动渲染器）。顶栏最右的图标也能循环切换时段。

## 结构

| 页面 | 内容 |
| --- | --- |
| `/` | 海面条 + 名字 + 最近 5 篇文章 + 3 个作品 + 4 张生活照 |
| `/posts/` | 全部文章，按年分组，年份是背景里的描边大字；每条只有标题和 `日期 · 分钟` |
| `/posts/<slug>/` | 标题、`日期 · 分钟`、目录（宽屏在左侧，窄屏折叠成一个图标）、正文、`> cd ..` |
| `/projects/` | 「Now / Built」两组，每个作品一个小图标或缩略图 + 名字 + 一句话 |
| `/life/` | 照片网格，悬停显示日期，点击用原生 Popover 打开大图（零 JS） |
| `/feed.xml` | RSS |

```
src/
  components/  Ocean.tsx（海面，唯一的 React 岛）· SiteHeader / SiteFooter / Icon / PostItem / ProjectCard / Moment.astro
  content/posts/*.md   文章（title / date / minutes? / sample）
  data/  projects.ts · life.ts
  lib/   posts.ts · time.ts（时段内联脚本）
  pages/ index · posts/index · posts/[slug] · projects · life · feed.xml.ts · 404
  styles/global.css    全部样式；四个时段各一组 CSS 变量
public/  fonts/ · posters/（海面静态帧）· textures/
scripts/ subset-fonts.py · screenshots.mjs · textcount.mjs · capture-posters.mjs
```

## 技术要点

- **Astro 7 静态输出**，React 只用于首页海面（`client:only`）。其他页面除了一段设定时段的内联脚本和顶栏切换按钮，没有 JS。
- **海面**：three.js r187 `WebGPURenderer` + TSL，从官方 `webgpu_ocean` 示例起步（`WaterMesh` + `SkyMesh` + bloom）。按容器尺寸渲染，宽而矮的海面条会自动收窄视角、把海平线放在约 62% 处。没有 WebGPU 时用 WebGL2；设备丢失先重试 WebGL2，再退回静态帧。滚出视口或切走标签页就暂停；减少动态效果时只显示静态帧。
- **跟着时间的光**：`<html data-time>` 在首帧前由内联脚本按 Asia/Shanghai 设定（05–08 清晨、08–16 正午、16–19 日落、其余夜晚），驱动海面参数和整站的底色、字色、代码高亮（夜晚用暗色主题）。
- **字体**：中文 OPPO Sans 4.0，用 `pnpm fonts` 按站内用字切成 woff2 子集（约 160 KB 预加载）+ GB2312 常用字分片按需加载；英文 Geist。22 MB 原始 TTF 不进仓库。
- **跨文档 View Transitions**：列表里的标题和文章页标题同名，点进去会平滑过渡。

## 迭代记录

### 第 1–5 轮：杂志版「海边周刊」（已推翻）
全屏海面封面、刊号 VOL.xx、目录、潮汐归档、漂流瓶留言。五轮截图自查，主要在调四个时段的光和字的可读性。

### 第 6 轮：减少文字
Shane 反馈「文字太多、要用界面而不是文字解释」。先统计每页可见文字（`scripts/textcount.mjs`），截图留底在 `screenshots/round-6-less-text/before/`。

### 第 7 轮：改成真正的博客（参考 treetreedi-me.vercel.app）
参考站截图在 `screenshots/reference-treetreedi/`。按它的模块重做：顶栏（Logo + 文章 / 作品 / 生活 + GitHub / RSS / 时段图标，手机上只留图标）、按年分组的文章列表、干净的文章页、作品网格、生活照片墙、`> cd ..` 页脚。

删除：杂志封面、刊号、栏目名、导语、目录页、潮汐归档、漂流瓶及其 API、Node 适配器、motion、所有解释性文字。首页可见字数从 489（430 个汉字 + 59 个英文词）降到 151，剩下的几乎都是文章标题。

- **r1**：发现桌面导航文字和图标同时出现；手机首页名字压在海上看不清；浅色代码块在米色底上太白；作品页的描边大字压住了条目。
- **r2**：修好以上问题。新发现：夜晚代码高亮没切到暗色主题；正午顶栏白字落在浅色天空上看不清。
- **r3**：夜晚代码改用暗色主题；正午顶栏改用深色字；手机海面条缩到 210px，名字移到海下（之前是 `.page` 的 padding 覆盖了 `.home`）。

截图命令：`OUT=screenshots/round-7-blog/r3 xvfb-run -a node scripts/screenshots.mjs x`（dev server 需在 4331）。截图不进 git。

## 已知问题

- WebGPU 只在软件渲染（SwiftShader）上验证过，真显卡上的观感和功耗要在 Mac 上再看。
- 作品除「海边」外没有真实截图，先用图标；链接只放了 GitHub 主页。
- 文章正文、生活照片都是占位，需要换成真内容；换完要跑 `pnpm fonts` 重新切字。
- `scripts/capture-posters.mjs` 还是按旧的全屏封面截静态帧；静态帧目前用 `background-size: cover` 裁进海面条，效果可以，但没有专门为窄条重新截。
