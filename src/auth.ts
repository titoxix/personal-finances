import { PrismaAdapter } from '@auth/prisma-adapter'
import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import type { UserRole } from '@/generated/prisma/client'
import { prisma } from '@/lib/prisma'

export const { handlers, auth, signIn, signOut } = NextAuth({
	adapter: PrismaAdapter(prisma),
	providers: [
		Google({
			// Matias' User row was created by the ownership backfill script before
			// he ever logged in, so it has no linked Google Account yet. Google is
			// the only provider this app supports, so auto-linking by email here
			// is safe (no cross-provider identity confusion risk).
			allowDangerousEmailAccountLinking: true,
		}),
	],
	session: { strategy: 'database' },
	pages: {
		signIn: '/login',
	},
	callbacks: {
		async session({ session, user }) {
			const dbUser = user as unknown as {
				role: UserRole
				country: string | null
			}
			session.user.id = user.id
			session.user.role = dbUser.role
			session.user.country = dbUser.country
			return session
		},
	},
})
