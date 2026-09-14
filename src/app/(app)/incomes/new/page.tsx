import { IncomeForm } from '@/components/incomes/IncomeForm'
import { requireUser } from '@/lib/auth-helpers'
import { exchangeRateService } from '@/lib/container'
import { createIncome } from '../actions'

export default async function NewIncomePage() {
	const user = await requireUser()
	const [itau, ueno] = await Promise.all([
		exchangeRateService.findLatestBySource(user.id, 'itau'),
		exchangeRateService.findLatestBySource(user.id, 'ueno'),
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
