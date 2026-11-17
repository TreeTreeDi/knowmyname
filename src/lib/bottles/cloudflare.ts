/**
 * Sketch for Cloudflare Workers + KV (not wired up yet — see README "Deploying to Cloudflare").
 * Bind a KV namespace as BOTTLES, then in src/pages/api/bottles.ts pick this store via
 * `new KvBottleStore(Astro.locals.runtime.env.BOTTLES)` when running on @astrojs/cloudflare.
 * A D1 table `bottles(id TEXT PRIMARY KEY, text TEXT, "from" TEXT, created_at TEXT)` works the same way
 * with `ORDER BY RANDOM() LIMIT 1`.
 */
import type { Bottle, BottleStore } from './types';

interface KVLike {
  get(key: string, type: 'json'): Promise<unknown>;
  put(key: string, value: string): Promise<void>;
}

export class KvBottleStore implements BottleStore {
  constructor(private kv: KVLike, private key = 'bottles:v1') {}

  private async all(): Promise<Bottle[]> {
    return ((await this.kv.get(this.key, 'json')) as Bottle[] | null) ?? [];
  }

  async add(input: { text: string; from?: string }) {
    const all = await this.all();
    const bottle: Bottle = { id: crypto.randomUUID(), ...input, createdAt: new Date().toISOString() };
    await this.kv.put(this.key, JSON.stringify([...all, bottle].slice(-500)));
    return bottle;
  }

  async random(excludeId?: string) {
    const pool = (await this.all()).filter((b) => b.id !== excludeId);
    return pool.length ? pool[Math.floor(Math.random() * pool.length)] : null;
  }

  async count() {
    return (await this.all()).length;
  }
}
