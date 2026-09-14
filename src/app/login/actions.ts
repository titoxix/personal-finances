'use server'

import { signIn } from '@/auth'

export async function googleSignIn(formData: FormData): Promise<void> {
	const next = (formData.get('next') as string) || '/'
	await signIn('google', { redirectTo: next })
}
