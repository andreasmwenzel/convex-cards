import path from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	server: {
		fs: {
			allow: [
				path.resolve(process.cwd(), 'src'),
				path.resolve(process.cwd(), 'convex'),
				path.resolve(process.cwd(), '.svelte-kit'),
				path.resolve(process.cwd(), 'node_modules')
			]
		}
	}
});
