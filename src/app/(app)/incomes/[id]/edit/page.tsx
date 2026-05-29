import { notFound } from 'next/navigation'
import { IncomeForm } from '@/components/incomes/IncomeForm'
import { exchangeRateService, incomeService } from '@/lib/container'
import type { UpdateIncomePayload } from '../../actions'
import { updateIncome } from '../../actions'

const MONTHS_ES = [
	'Enero',
	'Febrero',
	'Marzo',
	'Abril',
	'Mayo',
	'Junio',
	'Julio',
	'Agosto',
	'Septiembre',
	'Octubre',
	'Noviembre',
	'Diciembre',
]

export default async function EditIncomePage({
	params,
}: {
	params: Promise<{ id: string }>
}) {
	const { id: idStr } = await params
	const id = Number(idStr)
	if (Number.isNaN(id)) notFound()

	const [income, itau, ueno] = await Promise.all([
		incomeService.findById(id).catch(() => null),
		exchangeRateService.findLatestBySource('itau'),
		exchangeRateService.findLatestBySource('ueno'),
	])
	if (!income) notFound()

	const latestRates = [...(itau ? [itau] : []), ...(ueno ? [ueno] : [])]

	const monthLabel = `${MONTHS_ES[income.month.getUTCMonth()]} ${income.month.getUTCFullYear()}`

	async function handleUpdate(payload: UpdateIncomePayload) {
		'use server'
		return updateIncome(id, payload)
	}

	return (
		<IncomeForm
			mode="edit"
			monthLabel={monthLabel}
			onSubmit={handleUpdate}
			latestRates={latestRates}
			initialValues={{
				grossIncomeUsd: income.grossIncomeUsd,
				budgetCapUsd: income.budgetCapUsd,
				automaticInvestmentUsd: income.automaticInvestmentUsd,
				automaticDest: income.automaticDest,
				exchangeRate: income.exchangeRate,
				notes: income.notes ?? '',
			}}
		/>
	)
}
