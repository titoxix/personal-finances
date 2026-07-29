import type { DefaultSession } from 'next-auth'
import type { UserRole } from '@/generated/prisma/client'

declare module 'next-auth' {
	interface Session {
		user: {
			id: string
			role: UserRole
			country: string | null
		} & DefaultSession['user']
	}
}
