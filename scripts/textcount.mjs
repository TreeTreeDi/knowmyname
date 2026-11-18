// Usage: node scripts/textcount.mjs [baseUrl] > out.json
// Counts visible text per page: CJK characters + Latin words (+ digits groups), and dumps the visible strings.
import { chromium } from 'playwright';
const base = process.argv[2] ?? 'http://localhost:4331';
const pages = Object.fromEntries((process.env.PAGES ?? 'home=/?static,posts=/posts/,post=/posts/claude-code-memory-system/,projects=/projects/,life=/life/').split(',').map((kv) => kv.split('=')));
const browser = await chromium.launch({ headless: true });
const result = {};
for (const [name, path] of Object.entries(pages)) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(base + path, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  const text = await page.evaluate(() => document.body.innerText);
  const cjk = (text.match(/[\u3400-\u9fff]/g) ?? []).length;
  const latin = (text.match(/[A-Za-z0-9]+(?:[.'’:][A-Za-z0-9]+)*/g) ?? []).length;
  result[name] = { cjk, latin, total: cjk + latin, lines: text.split('\n').map((s) => s.trim()).filter(Boolean) };
  await page.close();
}
await browser.close();
console.log(JSON.stringify(result, null, 2));
