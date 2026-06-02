'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { COOKIE_NAME, getExpectedToken, MAX_AGE } from '@/lib/auth'

export async function loginAction(
	_prevState: { error: string } | null,
	formData: FormData,
): Promise<{ error: string }> {
	const email = formData.get('email') as string
	const password = formData.get('password') as string
	const next = (formData.get('next') as string) || '/'

	if (
		email !== process.env.LOGIN_EMAIL ||
		password !== process.env.LOGIN_PASSWORD
	) {
		return { error: 'Correo o contraseña incorrectos' }
	}

	const token = await getExpectedToken()
	const cookieStore = await cookies()
	cookieStore.set(COOKIE_NAME, token, {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'lax',
		maxAge: MAX_AGE,
	})

	redirect(next)
}

export async function logoutAction(): Promise<void> {
	const cookieStore = await cookies()
	cookieStore.set(COOKIE_NAME, '', {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'lax',
		maxAge: 0,
	})

	redirect('/login')
}
