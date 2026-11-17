import { promises as fs } from 'node:fs';
import path from 'node:path';
import { SEED_BOTTLES } from './seed';
import type { Bottle, BottleStore } from './types';

/** Local store: a JSON file next to the app (gitignored). Good enough for dev and a single Node box. */
export class FileBottleStore implements BottleStore {
  constructor(private file = path.resolve(process.cwd(), 'data/bottles.runtime.json')) {}

  private async load(): Promise<Bottle[]> {
    try {
      return JSON.parse(await fs.readFile(this.file, 'utf8')) as Bottle[];
    } catch {
      return [...SEED_BOTTLES];
    }
  }

  private async save(all: Bottle[]) {
    await fs.mkdir(path.dirname(this.file), { recursive: true });
    await fs.writeFile(this.file, JSON.stringify(all, null, 2));
  }

  async add(input: { text: string; from?: string }): Promise<Bottle> {
    const all = await this.load();
    const bottle: Bottle = { id: crypto.randomUUID(), text: input.text, from: input.from, createdAt: new Date().toISOString() };
    all.push(bottle);
    await this.save(all.slice(-500));
    return bottle;
  }

  async random(excludeId?: string): Promise<Bottle | null> {
    const pool = (await this.load()).filter((b) => b.id !== excludeId);
    return pool.length ? pool[Math.floor(Math.random() * pool.length)] : null;
  }

  async count() {
    return (await this.load()).length;
  }
}
