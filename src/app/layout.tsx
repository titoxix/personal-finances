import type { Metadata } from 'next'
import { JetBrains_Mono, Manrope } from 'next/font/google'
import './globals.css'

const manrope = Manrope({
	variable: '--font-manrope',
	subsets: ['latin'],
})

const jetbrainsMono = JetBrains_Mono({
	variable: '--font-jetbrains-mono',
	subsets: ['latin'],
	display: 'optional',
	preload: false,
})

export const metadata: Metadata = {
	title: 'Kashi - Smart Finance',
	description: 'AI-powered personal finance tracker',
	appleWebApp: {
		capable: true,
		statusBarStyle: 'black-translucent',
		title: 'Kashi',
	},
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html
			lang="es"
			className={`${manrope.variable} ${jetbrainsMono.variable} h-full antialiased dark`}
		>
			<body className="min-h-full" suppressHydrationWarning>
				{children}
			</body>
		</html>
	)
}
