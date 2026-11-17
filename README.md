# 海边周刊 · The Seaside Weekly

Shane 的个人博客，做成一本「海边周刊」：首页是一片随北京时间变色的实时海面，文章按刊号（VOL.xx）一期一期叠起来。

> 当前 6 期文章全部是**示例内容**（每篇文末和文章页左栏都有标注），用来展示版式和归档。

## 运行

```bash
pnpm install
pnpm dev          # http://localhost:4331 （端口写在 astro.config.mjs）
pnpm build        # 产物在 dist/（静态页 + Node 服务端入口）
node dist/server/entry.mjs   # 本地跑构建产物（漂流瓶 API 需要它）
```

调试参数（任意页面都可加）：

| 参数 | 作用 |
| --- | --- |
| `?time=dawn\|noon\|dusk\|night` | 强制光线（本标签页内记住）；`?time=auto` 恢复按北京时间 |
| `?gl` | 强制 WebGL2 后端（测回退） |
| `?static` | 不启动渲染器，只显示静态封面（等同 reduced-motion / 无 GPU） |

时段划分（Asia/Shanghai）：清晨 05–08，正午 08–16，日落 16–19，夜晚 19–05。首页右上角四个按钮也能切换，海面参数和字色约 1.5 秒过渡。

## 技术栈

- **Astro 7.4**（静态输出）+ **React 19 岛**：海面 `Ocean.tsx`（`client:only`）、漂流瓶 `Bottle.tsx`（`client:visible` / `client:load`）。
- **Three.js r187 `WebGPURenderer` + TSL**：从官方 `webgpu_ocean` 示例起步（`WaterMesh` + `SkyMesh` + `RenderPipeline` bloom），去掉示例里的方块、OrbitControls 和 Inspector，改成四组时段预设 + 指针视差 + 镜头轻微起伏。浏览器没有 WebGPU 时自动走 WebGL2 后端；运行中 GPU 设备丢失会先重试 WebGL2，再不行就退回静态封面。
- **静态封面**：`public/posters/{time}-{desktop|mobile}.jpg` 是用真实渲染截出来的帧（`scripts/capture-posters.mjs`），作为首屏第一帧和 reduced-motion / 无 GPU 时的降级，所以首屏不用等 WebGPU。
- **文章**：本地 MDX + Content Collections（`src/content/issues/*.mdx`），文章页只有一段 ~600 字节的内联脚本（设定时段），没有任何岛。
- **跨文档 View Transitions**：`@view-transition { navigation: auto }`，封面图和标题按 `cover-<id>` / `title-<id>` 命名，从首页封面、目录、归档点进文章都会飞入。
- **潮汐归档**：CSS 滚动驱动动画（`animation-timeline: view()` / `scroll(root)`），包在 `@supports` 里，不支持时就是静态的错落卡片；越早的刊物纸张越黄、照片越褪色（`--age` 变量）。
- **漂流瓶**：`/api/bottles`（GET 随机捞一只，可 `?exclude=id`；POST `{text, from?}` 扔一只）。存储接口 `BottleStore` 在 `src/lib/bottles/types.ts`，本地实现是 JSON 文件（`data/bottles.runtime.json`，已 gitignore），`cloudflare.ts` 里有 KV 版的草稿。API 不可用时前端自动退到 localStorage + 种子瓶子。
- **Motion**：只用在漂流瓶岛里（纸条展开、瓶子扔出去）。

## 字体

- 中文：**OPPO Sans 4.0**（可变字重 100–700）。`scripts/subset-fonts.py` 用 fontTools 从 `../fonts/OPPOSans4.0.ttf` 切出：
  - `oppo-sans-site.woff2`（~245 KB）：站内实际用到的约 720 个字，预加载；
  - `oppo-sans-common-00..17.woff2`（每片 ≤200 KB）：GB2312 其余常用字，按 `unicode-range` 用到哪片才下载哪片（读者在漂流瓶里打的字）。
  - 22 MB 原始 TTF 不进仓库、不进产物。改了文章后跑 `pnpm fonts` 重新切。
- 英文标题 / 刊号：**Geist Serif**；英文与数字正文：**Geist**（都来自 npm `geist`，拷到 `public/fonts/`）。

## 目录结构

```
src/
  components/  Ocean.tsx · Bottle.tsx · SiteHeader / SiteFooter / PullQuote.astro
  content/issues/  vol-01..06.mdx（示例）
  layouts/Base.astro       <head>、字体预加载、时段内联脚本
  lib/  issues.ts · time.ts · bottles/{types,seed,file-store,cloudflare}.ts
  pages/  index · issues/index（目录） · issues/[slug]（文章） · archive · bottle · api/bottles · 404
  styles/  global.css（tokens/基础/页眉页脚）+ home / toc / article / archive / bottles.css
public/  fonts/ · posters/ · textures/waternormals.jpg（three.js 官方贴图）
scripts/ subset-fonts.py · capture-posters.mjs · screenshots.mjs
screenshots/round-N/   每轮自查截图（不进 git）
```

## 迭代记录

截图命令：`xvfb-run -a node scripts/screenshots.mjs <N>`（需要 dev server 在 4331）。

**Round 1**（无头 Chromium）
- 第一版全部页面。发现：纯 headless 下 SwiftShader 的 WebGPU 设备在第一帧后就被销毁（裸 WebGPU 测试同样复现，是环境问题），海面成了一片白；`?gl` 的 WebGL2 回退正常。
- 封面左侧的「往期」列表和本期特稿的刊号挤在一起；日落时太阳光晕盖住了导航；首页「往期」网格中间空了一大块；手机上刊名折成两行；归档卡片整体做 sepia 后发柠檬黄；特稿标题写「日落是 17:12」，和页面上算出来的上海实际日落 16:55 对不上。

**Round 2**（改用 Xvfb 有头 Chromium，WebGPU 稳定出图）
- 加 GPU 设备丢失处理：先重试 WebGL2，再退静态封面。
- 导航移进顶栏；往期列表 + 封面照片收进右侧一栏；首页往期改成「1 大 + 2×2」；手机刊名一行；归档改成照片褪色 + 纸张随刊龄泛黄；特稿改名「日落是 16:55」。
- 新问题：正午天空发白、白字看不清；清晨靛蓝字压在深色海面上；夜晚「月亮」光晕太大压住右栏。

**Round 3**
- 调正午/夜晚参数，夜晚月亮移到左侧并收小光晕；清晨底部改成浅色晨雾，保证靛蓝字可读。
- 文章页加刊尾 folio、引文样式；特稿补了两节，展示更长的版式；阅读时长按 300 字/分钟。
- 归档潮位尺改成横排标签。截图验证了跨文档 View Transitions（`document.startViewTransition` 可用，点击后落到文章页）。

**Round 4**
- 正午改成「双色墨」：印在天上的刊名/顶栏/右栏用深海蓝，印在海面上的特稿保持白色。
- 静态封面换成真实渲染帧（每个时段桌面/手机各一张），首屏和降级都不再是渐变色块。
- 日落加一层偏紫的调色（Preetham 天空在日落时上半部偏橄榄绿）；封面加胶片颗粒，跟文章里的胶片照片统一。
- 修手机首页横向溢出（12 栏网格的 gap 撑宽了页面）；去掉 Astro prefetch 脚本，文章页回到只有一段内联脚本。
- 新增截图：日落→夜晚按钮切换后的画面。

**Round 5**
- 日落时右栏背后加一点暗角，往期列表不再被太阳光晕吃掉。
- 手机竖屏视野窄，日落的太阳和夜晚的月亮原来都跑出画面右/左边，现在按 0.35 倍往中间收；手机静态封面重新截帧。
- 最终截图见 `screenshots/round-5/`。

## 已知问题 / 取舍

- **WebGPU 截图是软件渲染**：box 上用 SwiftShader 出图，真机 GPU 下颜色和曝光可能略有差异，需要在 Mac 的 Chrome 上实际看一眼；Safari 26 起才默认开 WebGPU，旧 Safari 走 WebGL2。
- **海面很费 GPU**：`WaterMesh` 每帧要多渲一次反射。已做：像素比上限 1.5（手机 1.25）、滚出视口/切走标签页暂停、reduced-motion 直接不启动。低端机仍可能掉帧，后续可以加帧率检测自动降级到静态封面。
- **three.js 分包较大**（约 1 MB 未压缩，build 有 chunk size 警告）：是首屏后异步加载的，不阻塞首屏。
- **跨文档 View Transitions** 需要 Chrome/Edge 126+、Safari 18.2+；Firefox 退化成普通跳转。
- **漂流瓶没有审核和限流**：现在只有长度校验。上线前要加频率限制（Cloudflare Rate Limiting / Turnstile）和简单的敏感词过滤。
- **部署到 Cloudflare**：把 `@astrojs/node` 换成 `@astrojs/cloudflare`，绑定 KV（或 D1），在 `src/pages/api/bottles.ts` 里换成 `KvBottleStore`；`data/` 下的文件存储只适合单机。从国内访问 Cloudflare 的速度还没测。
- 封面和文章配图是 AI 生成的示意图，换成自己拍的照片后效果会更好。
