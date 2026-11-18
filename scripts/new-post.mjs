// pnpm new "文章标题" [slug]
// Creates src/content/posts/<slug>.md with frontmatter (draft: true) and an assets/ folder for images.
// Without a slug, one is made from the Latin words in the title, else from today's date.
import { mkdir, writeFile, access } from 'node:fs/promises';
import { join } from 'node:path';

const [title, slugArg] = process.argv.slice(2);
if (!title) {
  console.error('用法: pnpm new "文章标题" [slug]');
  process.exit(1);
}
const now = new Date();
const day = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai' }).format(now);
const latin = title.toLowerCase().match(/[a-z0-9]+/g)?.join('-');
const slug = (slugArg ?? (latin && latin.length > 3 ? latin : `post-${day}`)).replace(/[^a-z0-9-]/gi, '-').toLowerCase();

const dir = new URL('../src/content/posts/', import.meta.url).pathname;
const file = join(dir, `${slug}.md`);
try {
  await access(file);
  console.error(`已存在: ${file}`);
  process.exit(1);
} catch {}

const iso = new Date(now.getTime() + 8 * 3600e3).toISOString().slice(0, 19) + '+08:00';
await mkdir(join(dir, 'assets'), { recursive: true });
await writeFile(
  file,
  `---
title: ${JSON.stringify(title)}
date: ${iso}
description: ""
draft: true
---

<!-- 图片放进 src/content/posts/assets/，用 Obsidian 的 ![[图片.png]] 或 ![说明](./assets/图片.png) 引用 -->

`,
);
console.log(`✓ src/content/posts/${slug}.md  (draft: true，写完改成 false 再 push)`);
