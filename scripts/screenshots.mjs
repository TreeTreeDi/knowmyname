// Usage: node scripts/screenshots.mjs <round> [baseUrl]
// Chromium with WebGPU on SwiftShader Vulkan (software). Run under Xvfb: `xvfb-run -a node scripts/screenshots.mjs 3`.
// (Pure headless mode loses the WebGPU device after the first frame in this box; headful under Xvfb is stable.)
// Set HEADLESS=1 to force headless (then the ocean will usually fall back to WebGL2).
import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';

const round = process.argv[2] ?? '1';
const base = process.argv[3] ?? 'http://localhost:4331';
const out = `screenshots/round-${round}`;
await mkdir(out, { recursive: true });

const browser = await chromium.launch({
  headless: !!process.env.HEADLESS,
  args: ['--enable-unsafe-webgpu', '--enable-features=Vulkan', '--use-vulkan=swiftshader', '--ignore-gpu-blocklist', '--hide-scrollbars'],
});

const viewports = {
  desktop: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
  mobile: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
};
const log = [];

async function shoot(vpName, name, path, { full = false, scroll = 0, ocean = false, before } = {}) {
  const ctx = await browser.newContext(viewports[vpName]);
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(base + path, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  let renderer = null;
  if (ocean) {
    await page.waitForFunction(() => ['live', 'static'].includes(document.documentElement.dataset.ocean ?? ''), null, { timeout: 60000 }).catch(() => {});
    await page.waitForTimeout(2500);
    renderer = await page.evaluate(() => ({ ocean: document.documentElement.dataset.ocean, renderer: document.documentElement.dataset.renderer, time: document.documentElement.dataset.time }));
  }
  if (before) await before(page);
  if (scroll) {
    await page.evaluate((y) => window.scrollTo({ top: y * (document.documentElement.scrollHeight - innerHeight), behavior: 'instant' }), scroll);
    await page.waitForTimeout(800);
  }
  const file = `${out}/${vpName}-${name}.png`;
  await page.screenshot({ path: file, fullPage: full });
  log.push({ file, path, renderer, errors });
  console.log(file, renderer ? JSON.stringify(renderer) : '', errors.length ? `ERRORS: ${errors.join(' | ')}` : '');
  await ctx.close();
}

const only = process.env.ONLY?.split(',');
const want = (n) => !only || only.some((o) => n.includes(o));

for (const vp of ['desktop', 'mobile']) {
  for (const t of ['dawn', 'noon', 'dusk', 'night']) if (want(`home-${t}`)) await shoot(vp, `home-${t}`, `/?time=${t}`, { ocean: true });
  if (want('home-full')) await shoot(vp, 'home-full', '/?time=dusk&static', { full: true, ocean: true });
  if (want('toc')) await shoot(vp, 'toc', '/issues/?time=dusk', { full: true });
  if (want('article')) await shoot(vp, 'article', '/issues/vol-06/?time=dusk', { full: true });
  if (want('article-top')) await shoot(vp, 'article-top', '/issues/vol-04/?time=noon');
  if (want('archive')) {
    await shoot(vp, 'archive-top', '/archive/?time=dusk');
    await shoot(vp, 'archive-mid', '/archive/?time=dusk', { scroll: 0.45 });
    await shoot(vp, 'archive-end', '/archive/?time=dusk', { scroll: 0.82 });
  }
  if (want('bottle'))
    await shoot(vp, 'bottle', '/bottle/?time=dusk', {
      before: async (page) => {
        await page.getByRole('button', { name: '捞一只' }).click();
        await page.waitForTimeout(1800);
      },
    });
}
if (want('fallback')) {
  await shoot('desktop', 'home-static', '/?time=dusk&static', { ocean: true });
  for (const t of ['dawn', 'noon', 'dusk', 'night']) await shoot('desktop', `home-webgl2-${t}`, `/?time=${t}&gl`, { ocean: true });
  await shoot('mobile', 'home-static', '/?time=night&static', { ocean: true });
}

await writeFile(`${out}/log.json`, JSON.stringify(log, null, 2));
await browser.close();
