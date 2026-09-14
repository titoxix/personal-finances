export const dynamic = 'force-dynamic'

import { BottomNav } from '@/components/layout/BottomNav'
import { SidebarLoader } from '@/components/layout/SidebarLoader'
import { TopBar } from '@/components/layout/TopBar'
import { requireUser } from '@/lib/auth-helpers'
import { snapshotService } from '@/lib/container'

export default async function AppLayout({
	children,
}: {
	children: React.ReactNode
}) {
	const user = await requireUser()
	const snapshot = await snapshotService.findLatest(user.id)
	const balance = snapshot?.netWorthUsd ?? null
	const userName = user.name ?? user.email

	return (
		<div className="flex min-h-screen bg-background">
			<SidebarLoader
				balance={balance}
				userName={userName}
				isAdmin={user.role === 'ADMIN'}
			/>
			<div className="flex min-w-0 flex-1 flex-col lg:ml-[240px]">
				<TopBar balance={balance} userName={userName} />
				<main className="flex-1 overflow-x-hidden px-5 py-5 pb-28 lg:px-8 lg:py-8 lg:pb-10">
					<div className="mx-auto max-w-[680px] lg:max-w-none">{children}</div>
				</main>
			</div>
			<BottomNav />
		</div>
	)
}
