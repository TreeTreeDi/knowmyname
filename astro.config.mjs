// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';

// Fully static. React is only used for the sea (Ocean.tsx), hydrated on the home page.
export default defineConfig({
  site: 'https://seaside.example',
  integrations: [react(), mdx()],
  server: { port: 4331, host: true },
  devToolbar: { enabled: false },
  markdown: { shikiConfig: { themes: { light: 'github-light', dark: 'github-dark' } } },
});
