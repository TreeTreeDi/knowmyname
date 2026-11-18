import type { APIRoute } from 'astro';
import { getPosts } from '../lib/posts';

const esc = (s: string) => s.replace(/[<>&'"]/g, (c) => `&#${c.charCodeAt(0)};`);

export const GET: APIRoute = async ({ site }) => {
  const base = site?.toString().replace(/\/$/, '') ?? '';
  const items = (await getPosts())
    .map((p) => `<item><title>${esc(p.data.title)}</title><link>${base}/posts/${p.id}/</link><guid>${base}/posts/${p.id}/</guid><pubDate>${p.data.date.toUTCString()}</pubDate></item>`)
    .join('');
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>海边</title><link>${base}/</link><description>Shane</description>${items}</channel></rss>`;
  return new Response(xml, { headers: { 'content-type': 'application/rss+xml; charset=utf-8' } });
};
