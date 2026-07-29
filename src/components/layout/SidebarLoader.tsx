'use client'

import dynamic from 'next/dynamic'

const Sidebar = dynamic(
	() =>
		import('@/components/layout/Sidebar').then((m) => ({ default: m.Sidebar })),
	{
		ssr: false,
		loading: () => (
			<aside className="fixed left-0 top-0 h-full w-[240px] hidden lg:flex flex-col bg-[#0d1527] border-r border-[#1e2a3a]" />
		),
	},
)

type Props = { balance: number | null; userName: string; isAdmin?: boolean }

export function SidebarLoader({ balance, userName, isAdmin }: Props) {
	return <Sidebar balance={balance} userName={userName} isAdmin={isAdmin} />
}
