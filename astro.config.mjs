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
  // `astro sync`/`astro build` write the content layer's data store under
  // `isDev ? .astro/ : cacheDir` - Vitest (via getViteConfig) always resolves
  // as dev, so it only ever reads project-root `.astro/`. Pointing cacheDir
  // there too means `astro sync` populates the same file Vitest reads,
  // instead of leaving it in the (never-read-by-tests) node_modules/.astro.
  cacheDir: '.astro',
});
