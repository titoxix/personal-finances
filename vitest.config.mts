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

		// Integration tests share a single PostgreSQL test DB — run files sequentially
		// to prevent beforeEach/afterAll hooks in one file from deleting data owned by another
		fileParallelism: false,
	},
})
