import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: 'Kashi - Smart Finance',
		short_name: 'Kashi',
		description: 'AI-powered personal finance tracker',
		start_url: '/',
		display: 'standalone',
		background_color: '#0b1326',
		theme_color: '#0b1326',
		orientation: 'portrait',
		icons: [
			{
				src: '/icons/icon.svg',
				sizes: 'any',
				type: 'image/svg+xml',
				purpose: 'any',
			},
			{
				src: '/icons/icon.svg',
				sizes: 'any',
				type: 'image/svg+xml',
				purpose: 'maskable',
			},
		],
	}
}
