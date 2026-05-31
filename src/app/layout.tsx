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
})

export const metadata: Metadata = {
	title: 'Personal Finances',
	description: 'Seguimiento de finanzas personales',
	appleWebApp: {
		capable: true,
		statusBarStyle: 'black-translucent',
		title: 'Finanzas',
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
