'use client'

import { Info } from 'lucide-react'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover'

type Props = {
	content: string
}

export function InfoPopover({ content }: Props) {
	return (
		<Popover>
			<PopoverTrigger asChild>
				<button
					type="button"
					className="inline-flex items-center text-[#003824]/50 hover:text-[#003824]/80"
					aria-label="Más información"
				>
					<Info className="h-3 w-3" />
				</button>
			</PopoverTrigger>
			<PopoverContent className="max-w-[220px] text-xs text-muted-foreground">
				{content}
			</PopoverContent>
		</Popover>
	)
}
