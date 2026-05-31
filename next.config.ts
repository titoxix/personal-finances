import withSerwistInit from '@serwist/next'
import type { NextConfig } from 'next'

const withSerwist = withSerwistInit({
	swSrc: 'src/app/sw.ts',
	swDest: 'public/sw.js',
	disable: process.env.NODE_ENV === 'development',
})

const nextConfig: NextConfig = {
	// Serwist injects a webpack config; turbopack: {} tells Next.js 16 this is intentional
	turbopack: {},
	async headers() {
		return [
			{
				source: '/(.*)',
				headers: [
					{ key: 'X-Content-Type-Options', value: 'nosniff' },
					{ key: 'X-Frame-Options', value: 'DENY' },
					{
						key: 'Referrer-Policy',
						value: 'strict-origin-when-cross-origin',
					},
				],
			},
			{
				source: '/sw.js',
				headers: [
					{
						key: 'Content-Type',
						value: 'application/javascript; charset=utf-8',
					},
					{
						key: 'Cache-Control',
						value: 'no-cache, no-store, must-revalidate',
					},
				],
			},
		]
	},
}

export default withSerwist(nextConfig)
