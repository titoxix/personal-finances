import { Plus } from 'lucide-react'
import Link from 'next/link'
import { ExchangeRateList } from '@/components/exchange-rates/ExchangeRateList'
import { exchangeRateService } from '@/lib/container'

export default async function ExchangeRatesPage() {
	const rates = await exchangeRateService.findAll()

	return (
		<div>
			<div className="mb-5 flex items-end justify-between">
				<div>
					<p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
						Finanzas
					</p>
					<h1 className="text-2xl font-bold text-foreground">
						Tipos de Cambio
					</h1>
				</div>
				<Link
					href="/exchange-rates/new"
					className="flex shrink-0 items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
				>
					<Plus className="h-4 w-4" strokeWidth={2.5} />
					Nueva
				</Link>
			</div>

			<ExchangeRateList rates={rates} />
		</div>
	)
}
