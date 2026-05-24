import { notFound } from 'next/navigation'
import { transactionService, categoryService, essentialityService } from '@/lib/container'
import { TransactionForm } from '@/components/transactions/TransactionForm'
import { updateTransaction, deleteTransaction } from '../../actions'
import type { CreateTransactionPayload } from '../../actions'

export default async function EditTransactionPage({
	params,
}: {
	params: Promise<{ id: string }>
}) {
	const { id: idStr } = await params
	const id = Number(idStr)
	if (Number.isNaN(id)) notFound()

	const [transaction, categories, essentialityLevels] = await Promise.all([
		transactionService.findById(id).catch(() => null),
		categoryService.findAll(),
		essentialityService.findAll(),
	])

	if (!transaction) notFound()

	const activeCategories = categories.filter((c) => c.active)
	const activeLevels = essentialityLevels
		.filter((l) => l.active)
		.sort((a, b) => a.sortOrder - b.sortOrder)

	const initialValues: CreateTransactionPayload = {
		amount: transaction.amountUsd ?? transaction.amountGs ?? 0,
		currency: transaction.amountUsd != null ? 'usd' : 'gs',
		description: transaction.description,
		categoryId: transaction.categoryId,
		essentialityId: transaction.essentialityId,
		paymentMethod: transaction.paymentMethod,
		date: transaction.date.toISOString().split('T')[0] as string,
	}

	async function handleUpdate(payload: CreateTransactionPayload) {
		'use server'
		return updateTransaction(id, payload)
	}

	async function handleDelete() {
		'use server'
		return deleteTransaction(id)
	}

	return (
		<TransactionForm
			categories={activeCategories}
			essentialityLevels={activeLevels}
			onSubmit={handleUpdate}
			onDelete={handleDelete}
			initialValues={initialValues}
		/>
	)
}
