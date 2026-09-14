import { redirect } from 'next/navigation'
import { auth } from '@/auth'

export type CurrentUser = {
	id: string
	email: string
	name: string | null
	role: 'USER' | 'ADMIN'
	country: string | null
}

export async function requireUser(): Promise<CurrentUser> {
	const session = await auth()
	if (!session?.user?.id) redirect('/login')

	return {
		id: session.user.id,
		email: session.user.email ?? '',
		name: session.user.name ?? null,
		role: session.user.role,
		country: session.user.country,
	}
}

export async function requireAdmin(): Promise<CurrentUser> {
	const user = await requireUser()
	if (user.role !== 'ADMIN') redirect('/')
	return user
}
