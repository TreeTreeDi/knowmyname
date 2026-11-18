import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'posts'>;

export async function getPosts(): Promise<Post[]> {
  return (await getCollection('posts')).sort((a, b) => +b.data.date - +a.data.date);
}

const tz = 'Asia/Shanghai';
/** "Nov 19" */
export const shortDate = (d: Date) => new Intl.DateTimeFormat('en-US', { timeZone: tz, month: 'short', day: 'numeric' }).format(d);
export const year = (d: Date) => Number(new Intl.DateTimeFormat('en-US', { timeZone: tz, year: 'numeric' }).format(d));
export const isoDate = (d: Date) => new Intl.DateTimeFormat('en-CA', { timeZone: tz }).format(d);

/** ~300 CJK chars or ~220 Latin words per minute. */
export function minutesOf(post: Post): number {
  if (post.data.minutes) return post.data.minutes;
  const text = (post.body ?? '').replace(/```[\s\S]*?```/g, '');
  const cjk = (text.match(/[\u4e00-\u9fff]/g) ?? []).length;
  const words = (text.match(/[A-Za-z]+/g) ?? []).length;
  return Math.max(1, Math.round(cjk / 300 + words / 220));
}

export function byYear(posts: Post[]): [number, Post[]][] {
  const map = new Map<number, Post[]>();
  for (const p of posts) {
    const y = year(p.data.date);
    map.set(y, [...(map.get(y) ?? []), p]);
  }
  return [...map.entries()];
}

export const vtTitle = (p: Post) => `t-${p.id}`;
