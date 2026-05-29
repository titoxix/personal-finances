import { IncomeForm } from '@/components/incomes/IncomeForm'
import { exchangeRateService } from '@/lib/container'
import { createIncome } from '../actions'

export default async function NewIncomePage() {
	const [itau, ueno] = await Promise.all([
		exchangeRateService.findLatestBySource('itau'),
		exchangeRateService.findLatestBySource('ueno'),
	])

	const latestRates = [...(itau ? [itau] : []), ...(ueno ? [ueno] : [])]

	return (
		<IncomeForm
			mode="create"
			onSubmit={createIncome}
			latestRates={latestRates}
		/>
	)
}
