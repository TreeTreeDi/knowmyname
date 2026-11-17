import type { Bottle } from './types';

/** Bottles already floating out there on day one (sample content). */
export const SEED_BOTTLES: Bottle[] = [
  { id: 'seed-1', text: '今天终于把那个拖了三个月的重构合进去了。海风很大，心情很好。', from: '一个前端', createdAt: '2026-11-01T09:12:00+08:00' },
  { id: 'seed-2', text: '如果你也在加班，记得起来倒杯水。', from: '隔壁工位', createdAt: '2026-11-03T22:40:00+08:00' },
  { id: 'seed-3', text: '小时候以为大海的尽头是另一片海，现在觉得也许真是。', createdAt: '2026-11-05T18:05:00+08:00' },
  { id: 'seed-4', text: '把这句话扔进海里：明天会比今天好一点点，一点点就够了。', from: '路过的人', createdAt: '2026-11-08T07:31:00+08:00' },
  { id: 'seed-5', text: '日落的时候打开这个网页，海真的变成橘色了。', createdAt: '2026-11-12T17:14:00+08:00' },
  { id: 'seed-6', text: '捡到瓶子的人，祝你这周的 CI 都是绿的。', from: 'Shane', createdAt: '2026-11-15T23:02:00+08:00' },
];
