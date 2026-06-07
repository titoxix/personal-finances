import { TransactionForm } from '@/components/transactions/TransactionForm'
import {
	categoryService,
	essentialityService,
	recurringItemService,
} from '@/lib/container'
import { createTransaction } from '../actions'

export default async function NewTransactionPage({
	searchParams,
}: {
	searchParams: Promise<{ recurringItemId?: string }>
}) {
	const { recurringItemId: recurringItemIdParam } = await searchParams
	const [categories, essentialityLevels, recurringItems] = await Promise.all([
		categoryService.findAll(),
		essentialityService.findAll(),
		recurringItemService.findActive(),
	])

	const activeCategories = categories.filter((c) => c.active)
	const activeLevels = essentialityLevels
		.filter((l) => l.active)
		.sort((a, b) => a.sortOrder - b.sortOrder)

	const preselectedId =
		recurringItemIdParam != null ? Number(recurringItemIdParam) : undefined

	return (
		<TransactionForm
			categories={activeCategories}
			essentialityLevels={activeLevels}
			recurringItems={recurringItems}
			onSubmit={createTransaction}
			initialValues={
				preselectedId != null
					? {
							amount: 0,
							currency: 'gs',
							description: '',
							categoryId: 0,
							essentialityId: 0,
							paymentMethod: 'transferencia',
							date: new Date().toISOString().split('T')[0] as string,
							recurringItemId: preselectedId,
						}
					: undefined
			}
		/>
	)
}
