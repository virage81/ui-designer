import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

const root = path.resolve(__dirname, 'src');
// https://vite.dev/config/
export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			'@components': `${root}/components`,
			'@pages': `${root}/pages`,
			'@store': `${root}/store`,
			'@shared': `${root}/shared`,
			'@': root,
		},
	},
});
