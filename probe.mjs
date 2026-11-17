import { chromium } from 'playwright';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true });
const p = await ctx.newPage();
for (const path of ['/?static&time=dusk', '/issues/', '/issues/vol-06/', '/archive/', '/bottle/']) {
  await p.goto('http://localhost:4331' + path, { waitUntil: 'networkidle' });
  const r = await p.evaluate(() => {
    const W = document.documentElement.clientWidth;
    const over = [...document.querySelectorAll('body *')].filter(e => { const r = e.getBoundingClientRect(); return r.right > W + 1 && getComputedStyle(e).position !== 'fixed'; }).slice(0, 6).map(e => e.tagName + '.' + e.className + ' ' + Math.round(e.getBoundingClientRect().right));
    return { sw: document.documentElement.scrollWidth, W, over };
  });
  console.log(path, JSON.stringify(r));
}
await b.close();
