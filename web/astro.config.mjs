// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import remarkGfm from 'remark-gfm';

// https://astro.build/config
export default defineConfig({
	site: 'https://dogkit.vercel.app',
	redirects: {
		'/sitemap.xml': '/sitemap-index.xml',
	},
	integrations: [
		sitemap({
			filter: (page) => !page.includes('/admin/'),
		}),
	],
	markdown: {
		remarkPlugins: [remarkGfm],
	},
});
