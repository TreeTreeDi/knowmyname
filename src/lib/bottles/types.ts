/** A message in a bottle. Shape is shared by the API, the island and future Cloudflare storage. */
export interface Bottle {
  id: string;
  text: string;
  /** Optional signature, e.g. "一个路过的人". */
  from?: string;
  /** ISO timestamp. */
  createdAt: string;
}

/**
 * Storage port. Implementations: FileBottleStore (local dev / Node),
 * KvBottleStore (Cloudflare KV sketch in ./cloudflare.ts). A D1 version only needs these three methods.
 */
export interface BottleStore {
  add(input: { text: string; from?: string }): Promise<Bottle>;
  /** A random bottle, never the one with id `excludeId` (so you don't fish out your own). */
  random(excludeId?: string): Promise<Bottle | null>;
  count(): Promise<number>;
}

export const MAX_TEXT = 140;
export const MAX_FROM = 24;

export function validate(input: unknown): { text: string; from?: string } | string {
  if (!input || typeof input !== 'object') return '内容为空';
  const { text, from } = input as Record<string, unknown>;
  if (typeof text !== 'string' || !text.trim()) return '写点什么再扔吧';
  if ([...text.trim()].length > MAX_TEXT) return `一句话就好，最多 ${MAX_TEXT} 字`;
  if (from !== undefined && (typeof from !== 'string' || [...from].length > MAX_FROM)) return '署名太长了';
  return { text: text.trim(), from: typeof from === 'string' && from.trim() ? from.trim() : undefined };
}
