import { TransactionForm } from '@/components/transactions/TransactionForm'
import { categoryService, essentialityService } from '@/lib/container'
import { createTransaction } from '../actions'

export default async function NewTransactionPage() {
	const [categories, essentialityLevels] = await Promise.all([
		categoryService.findAll(),
		essentialityService.findAll(),
	])

	const activeCategories = categories.filter((c) => c.active)
	const activeLevels = essentialityLevels
		.filter((l) => l.active)
		.sort((a, b) => a.sortOrder - b.sortOrder)

	return (
		<TransactionForm
			categories={activeCategories}
			essentialityLevels={activeLevels}
			onSubmit={createTransaction}
		/>
	)
}
