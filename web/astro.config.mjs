// @ts-check
import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel';
import remarkGfm from 'remark-gfm';

const dataDir = path.resolve(fileURLToPath(import.meta.url), '../../data');

// https://astro.build/config
export default defineConfig({
	output: 'static',
	adapter: vercel(),
	vite: {
		envDir: '..',
		resolve: {
			alias: {
				'@data': dataDir,
			},
		},
		server: {
			fs: {
				allow: ['..'],
			},
		},
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
