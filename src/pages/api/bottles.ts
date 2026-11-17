import type { APIRoute } from 'astro';
import { FileBottleStore } from '../../lib/bottles/file-store';
import { validate } from '../../lib/bottles/types';

export const prerender = false;

const store = new FileBottleStore();
const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });

/** GET /api/bottles?exclude=<id> → { bottle, count } */
export const GET: APIRoute = async ({ url }) => {
  const bottle = await store.random(url.searchParams.get('exclude') ?? undefined);
  return json({ bottle, count: await store.count() });
};

/** POST /api/bottles { text, from? } → { bottle } */
export const POST: APIRoute = async ({ request }) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: '格式不对' }, 400);
  }
  const input = validate(body);
  if (typeof input === 'string') return json({ error: input }, 400);
  return json({ bottle: await store.add(input) }, 201);
};
