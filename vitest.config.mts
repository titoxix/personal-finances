import { createRequire } from 'node:module'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

const require = createRequire(import.meta.url)

export default defineConfig({
	plugins: [react()],
	resolve: {
		tsconfigPaths: true,
		alias: {
			// next-auth imports "next/server" without an extension; this Next.js
			// version ships no package.json "exports" map, so Vite's strict ESM
			// resolver can't find it without an explicit alias to the real file.
			'next/server': require.resolve('next/server.js'),
		},
	},
	test: {
		environment: 'jsdom',
		setupFiles: ['./src/test/setup.ts'],
		server: {
			// Force Vite to transform next-auth/@auth instead of loading them via
			// Node's native ESM resolver, which can't resolve their extensionless
			// "next/server" import against this Next.js version's exports-less package.json.
			deps: {
				inline: [/next-auth/, /@auth\//],
			},
		},
		// Unit tests (services, domain) don't need DOM — override per file with:
		// @vitest-environment node

		// Integration tests share a single PostgreSQL test DB — run files sequentially
		// to prevent beforeEach/afterAll hooks in one file from deleting data owned by another
		fileParallelism: false,
	},
})
