import {
	type CreateSnapshot,
	calculateDerivedMetrics,
	type Snapshot,
	type UpdateSnapshot,
} from '@/domain/entities/snapshot'
import type { ISnapshotRepository } from '@/domain/repositories/ISnapshotRepository'

function computeInvestedUsd(
	investments: ReadonlyArray<{ currency: string; value: number }>,
	exchangeRate: number | null | undefined,
): number {
	if (!exchangeRate || investments.length === 0) return 0
	return investments.reduce((sum, inv) => {
		return sum + (inv.currency === 'USD' ? inv.value : inv.value / exchangeRate)
	}, 0)
}

export function createSnapshotService(repo: ISnapshotRepository) {
	return {
		findAll: (): Promise<Snapshot[]> => repo.findAll(),

		findById: async (id: number): Promise<Snapshot> => {
			const snapshot = await repo.findById(id)
			if (!snapshot) throw new Error('Snapshot not found')
			return snapshot
		},

		findLatest: (): Promise<Snapshot | null> => repo.findLatest(),

		create: async (input: CreateSnapshot): Promise<Snapshot> => {
			const previous = await repo.findLatest()

			const currentTotalInvestedUsd = computeInvestedUsd(
				input.investments ?? [],
				input.exchangeRateValue,
			)
			const derived = calculateDerivedMetrics(
				input,
				previous?.totalInvestedUsd ?? null,
				currentTotalInvestedUsd,
			)

			return repo.create({
				...input,
				netWorthUsd: derived.netWorthUsd ?? undefined,
				totalInvestedUsd: derived.totalInvestedUsd ?? undefined,
				totalDebtUsd: derived.totalDebtUsd ?? undefined,
				savingsRatePct: derived.savingsRatePct ?? undefined,
			})
		},

		update: async (id: number, input: UpdateSnapshot): Promise<Snapshot> => {
			const [existing, latest] = await Promise.all([
				repo.findById(id),
				repo.findLatest(),
			])
			if (!existing) throw new Error('Snapshot not found')

			const previous = latest?.id === id ? null : latest

			const m = <T>(incoming: T | undefined, current: T): T =>
				incoming !== undefined ? incoming : current

			const fields = {
				incomeUsd: m(input.incomeUsd, existing.incomeUsd),
				exchangeRateValue: m(
					input.exchangeRateValue,
					existing.exchangeRateValue,
				),
				balanceItauUsd: m(input.balanceItauUsd, existing.balanceItauUsd),
				balanceItauGs: m(input.balanceItauGs, existing.balanceItauGs),
				balanceUenoUsd: m(input.balanceUenoUsd, existing.balanceUenoUsd),
				balanceUenoGs: m(input.balanceUenoGs, existing.balanceUenoGs),
				balanceMangoGs: m(input.balanceMangoGs, existing.balanceMangoGs),
				balanceGnbGs: m(input.balanceGnbGs, existing.balanceGnbGs),
				gnbCardGs: m(input.gnbCardGs, existing.gnbCardGs),
				itauCardGs: m(input.itauCardGs, existing.itauCardGs),
				uenoCardGs: m(input.uenoCardGs, existing.uenoCardGs),
				pendingInstallmentsGs: m(
					input.pendingInstallmentsGs,
					existing.pendingInstallmentsGs,
				),
			}

			const investmentsForCalc =
				input.investments !== undefined
					? input.investments
					: existing.investments
			const currentTotalInvestedUsd = computeInvestedUsd(
				investmentsForCalc,
				fields.exchangeRateValue,
			)
			const derived = calculateDerivedMetrics(
				fields,
				previous?.totalInvestedUsd ?? null,
				currentTotalInvestedUsd,
			)

			return repo.update(id, {
				...input,
				netWorthUsd: derived.netWorthUsd,
				totalInvestedUsd: derived.totalInvestedUsd,
				totalDebtUsd: derived.totalDebtUsd,
				savingsRatePct: derived.savingsRatePct,
			})
		},
	}
}
