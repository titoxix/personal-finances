'use client'

import type { LucideIcon } from 'lucide-react'

type Props = {
	icon: LucideIcon
	label: string
	onClick: () => void
}

export function ExportOptionCard({ icon: Icon, label, onClick }: Props) {
	return (
		<button
			type="button"
			onClick={onClick}
			className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left transition-colors hover:bg-accent"
		>
			<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
				<Icon className="h-5 w-5 text-primary" />
			</div>
			<span className="text-sm font-medium text-foreground">{label}</span>
		</button>
	)
}
