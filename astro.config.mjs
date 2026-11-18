// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import { unified } from '@astrojs/markdown-remark';
import remarkObsidian from './src/lib/remark-obsidian.mjs';
import oldUrls from './src/data/redirects.json' with { type: 'json' };

// Fully static. React is only used for the sea (Ocean.tsx), hydrated on the home page.
export default defineConfig({
  site: 'https://knowmyname.vercel.app',
  integrations: [react(), mdx()],
  // Old treetreedi.me post URLs (file-name slugs with Chinese titles) → new short slugs.
  redirects: oldUrls,
  server: { port: 4331, host: true },
  devToolbar: { enabled: false },
  markdown: {
    // unified() so the small Obsidian-compat remark plugin runs (Astro 7 defaults to Sätteri, which has no remark plugins).
    processor: unified({ remarkPlugins: [remarkObsidian] }),
    shikiConfig: { themes: { light: 'github-light', dark: 'github-dark' }, excludeLangs: ['mermaid'] },
  },
});
