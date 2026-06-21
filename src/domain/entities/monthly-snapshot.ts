import { z } from 'zod'
import {
	CreateSnapshotInvestmentSchema,
	SnapshotInvestmentSchema,
} from './snapshot-investment'

export type SnapshotRawFields = {
	incomeUsd?: number | null
	exchangeRateValue?: number | null
	balanceItauUsd?: number | null
	balanceItauGs?: number | null
	balanceUenoUsd?: number | null
	balanceUenoGs?: number | null
	balanceMangoGs?: number | null
	balanceGnbGs?: number | null
	gnbCardGs?: number | null
	itauCardGs?: number | null
	uenoCardGs?: number | null
	pendingInstallmentsGs?: number | null
}

export type SnapshotDerivedMetrics = {
	netWorthUsd: number | null
	totalInvestedUsd: number | null
	totalDebtUsd: number | null
	savingsRatePct: number | null
}

function round2(v: number): number {
	return Math.round(v * 100) / 100
}

export function calculateDerivedMetrics(
	fields: SnapshotRawFields,
	previousTotalInvestedUsd: number | null,
	currentTotalInvestedUsd = 0,
): SnapshotDerivedMetrics {
	const n = (v: number | null | undefined): number => v ?? 0
	const rate = fields.exchangeRateValue

	if (!rate) {
		return {
			totalDebtUsd: null,
			totalInvestedUsd: null,
			netWorthUsd: null,
			savingsRatePct: null,
		}
	}

	const totalDebtUsd = round2(
		(n(fields.itauCardGs) +
			n(fields.uenoCardGs) +
			n(fields.gnbCardGs) +
			n(fields.pendingInstallmentsGs)) /
			rate,
	)

	const totalInvestedUsd = round2(currentTotalInvestedUsd)

	const activosTotalesUsd =
		n(fields.balanceItauUsd) +
		n(fields.balanceItauGs) / rate +
		n(fields.balanceUenoUsd) +
		n(fields.balanceUenoGs) / rate +
		n(fields.balanceMangoGs) / rate +
		n(fields.balanceGnbGs) / rate +
		totalInvestedUsd

	const netWorthUsd = round2(activosTotalesUsd - totalDebtUsd)

	const incomeUsd = fields.incomeUsd
	let savingsRatePct: number | null = null
	if (previousTotalInvestedUsd !== null && incomeUsd) {
		const raw =
			((totalInvestedUsd - previousTotalInvestedUsd) / incomeUsd) * 100
		savingsRatePct = Math.abs(raw) > 999.99 ? null : round2(raw)
	}

	return { totalDebtUsd, totalInvestedUsd, netWorthUsd, savingsRatePct }
}

export const MonthlySnapshotSchema = z.object({
	id: z.number(),
	month: z.date(),
	incomeUsd: z.number().nullable(),
	exchangeRateValue: z.number().nullable(),
	exchangeRateId: z.number().nullable(),
	balanceItauUsd: z.number().nullable(),
	balanceItauGs: z.number().nullable(),
	balanceUenoUsd: z.number().nullable(),
	balanceUenoGs: z.number().nullable(),
	balanceMangoGs: z.number().nullable(),
	balanceGnbGs: z.number().nullable(),
	gnbCardGs: z.number().nullable(),
	itauCardGs: z.number().nullable(),
	uenoCardGs: z.number().nullable(),
	pendingInstallmentsGs: z.number().nullable(),
	netWorthUsd: z.number().nullable(),
	totalInvestedUsd: z.number().nullable(),
	totalDebtUsd: z.number().nullable(),
	savingsRatePct: z.number().nullable(),
	notes: z.string().nullable(),
	createdAt: z.date(),
	investments: z.array(SnapshotInvestmentSchema),
})
export type MonthlySnapshot = z.infer<typeof MonthlySnapshotSchema>

export const CreateMonthlySnapshotSchema = z.object({
	month: z.coerce.date(),
	incomeUsd: z.number().optional(),
	exchangeRateValue: z.number().positive().optional(),
	exchangeRateId: z.number().int().positive().optional(),
	balanceItauUsd: z.number().optional(),
	balanceItauGs: z.number().optional(),
	balanceUenoUsd: z.number().optional(),
	balanceUenoGs: z.number().optional(),
	balanceMangoGs: z.number().optional(),
	balanceGnbGs: z.number().optional(),
	gnbCardGs: z.number().optional(),
	itauCardGs: z.number().optional(),
	uenoCardGs: z.number().optional(),
	pendingInstallmentsGs: z.number().optional(),
	notes: z.string().optional(),
	investments: z.array(CreateSnapshotInvestmentSchema).optional(),
})
export type CreateMonthlySnapshot = z.infer<typeof CreateMonthlySnapshotSchema>

export const UpdateMonthlySnapshotSchema = z.object({
	incomeUsd: z.number().nullable().optional(),
	exchangeRateValue: z.number().positive().nullable().optional(),
	exchangeRateId: z.number().int().positive().nullable().optional(),
	balanceItauUsd: z.number().nullable().optional(),
	balanceItauGs: z.number().nullable().optional(),
	balanceUenoUsd: z.number().nullable().optional(),
	balanceUenoGs: z.number().nullable().optional(),
	balanceMangoGs: z.number().nullable().optional(),
	balanceGnbGs: z.number().nullable().optional(),
	gnbCardGs: z.number().nullable().optional(),
	itauCardGs: z.number().nullable().optional(),
	uenoCardGs: z.number().nullable().optional(),
	pendingInstallmentsGs: z.number().nullable().optional(),
	notes: z.string().nullable().optional(),
	investments: z.array(CreateSnapshotInvestmentSchema).optional(),
})
export type UpdateMonthlySnapshot = z.infer<typeof UpdateMonthlySnapshotSchema>
