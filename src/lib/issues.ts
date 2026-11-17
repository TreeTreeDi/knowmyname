import { getCollection, type CollectionEntry } from 'astro:content';

export type Issue = CollectionEntry<'issues'>;

/** Newest first. */
export async function getIssues(): Promise<Issue[]> {
  const all = await getCollection('issues');
  return all.sort((a, b) => b.data.vol - a.data.vol);
}

export const volLabel = (vol: number) => `VOL.${String(vol).padStart(2, '0')}`;
export const volNum = (vol: number) => String(vol).padStart(2, '0');

export const fmtDate = (d: Date) =>
  `${d.getUTCFullYear()}.${String(d.getUTCMonth() + 1).padStart(2, '0')}.${String(d.getUTCDate()).padStart(2, '0')}`;

/** Rough CJK reading time: ~300 chars per minute (unhurried reading). */
export function readingMinutes(body: string | undefined): number {
  const text = (body ?? '').replace(/<[^>]+>|[#*`>\-\[\]()]/g, '');
  const cjk = (text.match(/[\u4e00-\u9fff]/g) ?? []).length;
  const latinWords = (text.match(/[A-Za-z]+/g) ?? []).length;
  return Math.max(1, Math.round(cjk / 300 + latinWords / 220));
}

export const slugOf = (issue: Issue) => issue.id;
export const vtCover = (issue: Issue) => `cover-${issue.id}`;
export const vtTitle = (issue: Issue) => `title-${issue.id}`;
