// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://victorzamudio.dev',
  integrations: [sitemap()],
  scopedStyleStrategy: 'where',
  build: {
    assets: 'assets',
  },
});
