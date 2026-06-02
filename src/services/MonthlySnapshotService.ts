import {
	type CreateMonthlySnapshot,
	calculateDerivedMetrics,
	type MonthlySnapshot,
	type UpdateMonthlySnapshot,
} from '@/domain/entities/monthly-snapshot'
import type { IMonthlySnapshotRepository } from '@/domain/repositories/IMonthlySnapshotRepository'

function computeInvestedUsd(
	investments: ReadonlyArray<{ currency: string; value: number }>,
	exchangeRate: number | null | undefined,
): number {
	if (!exchangeRate || investments.length === 0) return 0
	return investments.reduce((sum, inv) => {
		return sum + (inv.currency === 'USD' ? inv.value : inv.value / exchangeRate)
	}, 0)
}

export function createMonthlySnapshotService(repo: IMonthlySnapshotRepository) {
	return {
		findAll: (): Promise<MonthlySnapshot[]> => repo.findAll(),

		findById: async (id: number): Promise<MonthlySnapshot> => {
			const snapshot = await repo.findById(id)
			if (!snapshot) throw new Error('MonthlySnapshot not found')
			return snapshot
		},

		findByMonth: (month: Date): Promise<MonthlySnapshot | null> =>
			repo.findByMonth(month),

		findLatest: (): Promise<MonthlySnapshot | null> => repo.findLatest(),

		create: async (input: CreateMonthlySnapshot): Promise<MonthlySnapshot> => {
			const [existing, previous] = await Promise.all([
				repo.findByMonth(input.month),
				repo.findLatest(),
			])
			if (existing)
				throw new Error('MonthlySnapshot already exists for this month')

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

		update: async (
			id: number,
			input: UpdateMonthlySnapshot,
		): Promise<MonthlySnapshot> => {
			const [existing, latest] = await Promise.all([
				repo.findById(id),
				repo.findLatest(),
			])
			if (!existing) throw new Error('MonthlySnapshot not found')

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
