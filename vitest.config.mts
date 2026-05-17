import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
	plugins: [react()],
	resolve: {
		tsconfigPaths: true,
	},
	test: {
		environment: 'jsdom',
		setupFiles: ['./src/test/setup.ts'],
		// Unit tests (services, domain) don't need DOM — override per file with:
		// @vitest-environment node
	},
})
