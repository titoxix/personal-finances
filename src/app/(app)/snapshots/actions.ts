'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { monthlySnapshotService } from '@/lib/container'

export type CreateSnapshotPayload = {
	month: Date
	incomeUsd?: number
	exchangeRateValue?: number
	balanceItauUsd?: number
	balanceItauGs?: number
	balanceUenoUsd?: number
	balanceUenoGs?: number
	balanceMangoGs?: number
	balanceGnbGs?: number
	gnbCardGs?: number
	investorFundUsd?: number
	investorFundGs?: number
	investorReturnPct?: number
	etfPortfolioUsd?: number
	etfReturnPct?: number
	itauCardGs?: number
	uenoCardGs?: number
	pendingInstallmentsGs?: number
	netWorthUsd?: number
	totalInvestedUsd?: number
	totalDebtUsd?: number
	savingsRatePct?: number
	notes?: string
}

export type UpdateSnapshotPayload = {
	incomeUsd?: number | null
	exchangeRateValue?: number | null
	balanceItauUsd?: number | null
	balanceItauGs?: number | null
	balanceUenoUsd?: number | null
	balanceUenoGs?: number | null
	balanceMangoGs?: number | null
	balanceGnbGs?: number | null
	gnbCardGs?: number | null
	investorFundUsd?: number | null
	investorFundGs?: number | null
	investorReturnPct?: number | null
	etfPortfolioUsd?: number | null
	etfReturnPct?: number | null
	itauCardGs?: number | null
	uenoCardGs?: number | null
	pendingInstallmentsGs?: number | null
	netWorthUsd?: number | null
	totalInvestedUsd?: number | null
	totalDebtUsd?: number | null
	savingsRatePct?: number | null
	notes?: string | null
}

export async function createSnapshot(
	payload: CreateSnapshotPayload,
): Promise<{ error: string } | undefined> {
	try {
		await monthlySnapshotService.create(payload)
	} catch (e) {
		return {
			error: e instanceof Error ? e.message : 'Error al crear el snapshot',
		}
	}
	revalidatePath('/snapshots')
	redirect('/snapshots')
}

export async function updateSnapshot(
	id: number,
	payload: UpdateSnapshotPayload,
): Promise<{ error: string } | undefined> {
	try {
		await monthlySnapshotService.update(id, payload)
	} catch (e) {
		return {
			error: e instanceof Error ? e.message : 'Error al actualizar el snapshot',
		}
	}
	revalidatePath('/snapshots')
	redirect('/snapshots')
}
