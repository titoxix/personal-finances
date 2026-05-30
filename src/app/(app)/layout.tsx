export const dynamic = 'force-dynamic'

import { BottomNav } from '@/components/layout/BottomNav'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'
import { monthlySnapshotService } from '@/lib/container'

export default async function AppLayout({
	children,
}: {
	children: React.ReactNode
}) {
	const snapshot = await monthlySnapshotService.findLatest()
	const balance = snapshot?.netWorthUsd ?? null

	return (
		<div className="flex min-h-screen bg-background">
			<Sidebar balance={balance} />
			<div className="flex min-w-0 flex-1 flex-col lg:ml-[240px]">
				<TopBar balance={balance} />
				<main className="flex-1 overflow-x-hidden px-5 py-5 pb-28 lg:px-8 lg:py-8 lg:pb-10">
					<div className="mx-auto max-w-[680px] lg:max-w-none">{children}</div>
				</main>
			</div>
			<BottomNav />
		</div>
	)
}
