import { notFound } from 'next/navigation'
import { ExchangeRateForm } from '@/components/exchange-rates/ExchangeRateForm'
import { requireUser } from '@/lib/auth-helpers'
import { exchangeRateService } from '@/lib/container'
import { deleteExchangeRate, updateExchangeRate } from '../../actions'

export default async function EditExchangeRatePage({
	params,
}: {
	params: Promise<{ id: string }>
}) {
	const user = await requireUser()
	const { id: idStr } = await params
	const id = Number(idStr)
	if (Number.isNaN(id)) notFound()

	const rate = await exchangeRateService.findById(user.id, id).catch(() => null)
	if (!rate) notFound()

	async function handleUpdate(
		payload: Parameters<typeof updateExchangeRate>[1],
	) {
		'use server'
		return updateExchangeRate(id, payload)
	}

	async function handleDelete() {
		'use server'
		return deleteExchangeRate(id)
	}

	return (
		<ExchangeRateForm
			mode="edit"
			initialValues={rate}
			onSubmit={handleUpdate}
			onDelete={handleDelete}
		/>
	)
}
