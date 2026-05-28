import { notFound } from 'next/navigation'
import { exchangeRateService } from '@/lib/container'
import { ExchangeRateForm } from '@/components/exchange-rates/ExchangeRateForm'
import { updateExchangeRate, deleteExchangeRate } from '../../actions'

export default async function EditExchangeRatePage({
	params,
}: {
	params: Promise<{ id: string }>
}) {
	const { id: idStr } = await params
	const id = Number(idStr)
	if (Number.isNaN(id)) notFound()

	const rate = await exchangeRateService.findById(id).catch(() => null)
	if (!rate) notFound()

	async function handleUpdate(payload: Parameters<typeof updateExchangeRate>[1]) {
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
