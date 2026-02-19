// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel';
import remarkGfm from 'remark-gfm';

// https://astro.build/config
export default defineConfig({
	output: 'static',
	adapter: vercel(),
	vite: {
		envDir: '..',
	},
	site: 'https://dogkit.vercel.app',
	redirects: {
		'/sitemap.xml': '/sitemap-index.xml',
	},
	integrations: [
		react(),
		sitemap({
			filter: (page) => !page.includes('/admin/'),
		}),
	],
	markdown: {
		remarkPlugins: [remarkGfm],
	},
});
