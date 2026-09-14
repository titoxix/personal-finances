import { NextResponse } from 'next/server'
import { auth } from '@/auth'

const PUBLIC_PATHS = ['/login']

export default auth((request) => {
	const { pathname } = request.nextUrl

	if (
		PUBLIC_PATHS.includes(pathname) ||
		pathname.startsWith('/api/auth') ||
		pathname.startsWith('/_next/') ||
		pathname.startsWith('/favicon') ||
		pathname === '/manifest.webmanifest' ||
		pathname === '/sw.js'
	) {
		return NextResponse.next()
	}

	if (!request.auth) {
		const loginUrl = new URL('/login', request.url)
		loginUrl.searchParams.set('next', pathname)
		return NextResponse.redirect(loginUrl)
	}

	if (!request.auth.user.country && pathname !== '/onboarding') {
		return NextResponse.redirect(new URL('/onboarding', request.url))
	}

	return NextResponse.next()
})

export const config = {
	matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
