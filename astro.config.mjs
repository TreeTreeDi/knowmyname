// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import node from '@astrojs/node';

// Static pages everywhere; only /api/bottles is rendered on demand.
// The Node adapter is the local stand-in; swap for @astrojs/cloudflare when deploying (see README).
export default defineConfig({
  site: 'https://seaside.example',
  integrations: [react(), mdx()],
  adapter: node({ mode: 'standalone' }),
  server: { port: 4331, host: true },
  devToolbar: { enabled: false },
});
