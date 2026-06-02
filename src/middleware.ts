import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { COOKIE_NAME, getExpectedToken, safeEqual } from '@/lib/auth'

export async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl

	if (
		pathname === '/login' ||
		pathname.startsWith('/_next/') ||
		pathname.startsWith('/favicon') ||
		pathname === '/manifest.webmanifest' ||
		pathname === '/sw.js'
	) {
		return NextResponse.next()
	}

	const token = request.cookies.get(COOKIE_NAME)?.value

	if (!token) {
		const loginUrl = new URL('/login', request.url)
		loginUrl.searchParams.set('next', pathname)
		return NextResponse.redirect(loginUrl)
	}

	const expected = await getExpectedToken()
	if (!safeEqual(token, expected)) {
		const loginUrl = new URL('/login', request.url)
		loginUrl.searchParams.set('next', pathname)
		return NextResponse.redirect(loginUrl)
	}

	return NextResponse.next()
}

export const config = {
	matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
