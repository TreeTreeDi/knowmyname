// Renders the live sea at each time of day without the cover UI and saves JPEG posters
// to public/posters/. They are the first paint and the reduced-motion / no-GPU fallback.
// Usage (dev server running): xvfb-run -a node scripts/capture-posters.mjs
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const base = process.argv[2] ?? 'http://localhost:4331';
await mkdir('public/posters', { recursive: true });
const browser = await chromium.launch({
  headless: false,
  args: ['--enable-unsafe-webgpu', '--enable-features=Vulkan', '--use-vulkan=swiftshader', '--ignore-gpu-blocklist', '--hide-scrollbars'],
});
const sizes = { desktop: { width: 1600, height: 1000, dpr: 1 }, mobile: { width: 430, height: 932, dpr: 2 } };
for (const [kind, s] of Object.entries(sizes)) {
  for (const t of ['dawn', 'noon', 'dusk', 'night']) {
    const ctx = await browser.newContext({ viewport: { width: s.width, height: s.height }, deviceScaleFactor: s.dpr, isMobile: kind === 'mobile' });
    const page = await ctx.newPage();
    await page.goto(`${base}/?time=${t}`, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => document.documentElement.dataset.ocean === 'live', null, { timeout: 60000 });
    await page.addStyleTag({ content: '.cover-grid,.cover-shade,.cover-stars,.scroll-cue,.cover-poster{display:none!important} .ocean-canvas{opacity:1!important;transition:none!important}' });
    await page.waitForTimeout(2500);
    const file = `public/posters/${t}-${kind}.jpg`;
    await page.locator('.cover').screenshot({ path: file, type: 'jpeg', quality: 78 });
    console.log(file);
    await ctx.close();
  }
}
await browser.close();
