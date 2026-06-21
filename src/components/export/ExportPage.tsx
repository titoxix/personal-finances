'use client'

import { useState } from 'react'
import { ExportOptionCard } from './ExportOptionCard'
import { ExportSheet } from './ExportSheet'
import { EXPORT_OPTIONS, type ExportOption } from './export-options'

export function ExportPage() {
	const [selectedOption, setSelectedOption] = useState<ExportOption | null>(
		null,
	)

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-xl font-bold text-foreground">Exportar Datos</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Seleccioná qué datos querés exportar como JSON
				</p>
			</div>

			<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
				{EXPORT_OPTIONS.map((option) => (
					<ExportOptionCard
						key={option.type}
						icon={option.icon}
						label={option.label}
						onClick={() => setSelectedOption(option)}
					/>
				))}
			</div>

			{selectedOption && (
				<ExportSheet
					option={selectedOption}
					open={!!selectedOption}
					onClose={() => setSelectedOption(null)}
				/>
			)}
		</div>
	)
}
