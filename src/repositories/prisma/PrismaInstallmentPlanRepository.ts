import type { InstallmentPlan } from '@/domain/entities/installment-plan'
import type { PaymentMethod } from '@/domain/entities/recurring-item'
import type {
	CreateInstallmentPlanInput,
	IInstallmentPlanRepository,
	UpdateInstallmentPlanInput,
} from '@/domain/repositories/IInstallmentPlanRepository'
import type { PrismaClient } from '@/generated/prisma/client'

type PrismaInstallmentPlan = {
	id: number
	description: string
	totalAmountGs: { toNumber(): number } | null
	totalAmountUsd: { toNumber(): number } | null
	installmentsTotal: number
	installmentsPaid: number
	installmentAmountGs: { toNumber(): number } | null
	startDate: Date
	endDate: Date | null
	paymentMethod: PaymentMethod
	categoryId: number
	essentialityId: number
	active: boolean
	notes: string | null
	createdAt: Date
}

function toDomain(raw: PrismaInstallmentPlan): InstallmentPlan {
	return {
		id: raw.id,
		description: raw.description,
		totalAmountGs: raw.totalAmountGs?.toNumber() ?? null,
		totalAmountUsd: raw.totalAmountUsd?.toNumber() ?? null,
		installmentsTotal: raw.installmentsTotal,
		installmentsPaid: raw.installmentsPaid,
		installmentAmountGs: raw.installmentAmountGs?.toNumber() ?? null,
		startDate: raw.startDate,
		endDate: raw.endDate,
		paymentMethod: raw.paymentMethod,
		categoryId: raw.categoryId,
		essentialityId: raw.essentialityId,
		active: raw.active,
		notes: raw.notes,
		createdAt: raw.createdAt,
	}
}

export function createPrismaInstallmentPlanRepository(
	prisma: PrismaClient,
): IInstallmentPlanRepository {
	return {
		findAll: async (userId) => {
			const rows = await prisma.installmentPlan.findMany({
				where: { userId },
			})
			return rows.map(toDomain)
		},
		findById: async (userId, id) => {
			const row = await prisma.installmentPlan.findUnique({
				where: { id, userId },
			})
			return row ? toDomain(row) : null
		},
		findActive: async (userId) => {
			const rows = await prisma.installmentPlan.findMany({
				where: { userId, active: true },
			})
			return rows.map(toDomain)
		},
		findActiveInDateRange: async (userId, start: Date, end: Date) => {
			const rows = await prisma.installmentPlan.findMany({
				where: {
					userId,
					startDate: { lt: end },
					OR: [{ endDate: null }, { endDate: { gte: start } }],
				},
			})
			return rows.map(toDomain)
		},
		create: async (userId, input: CreateInstallmentPlanInput) => {
			const row = await prisma.installmentPlan.create({
				data: { ...input, userId },
			})
			return toDomain(row)
		},
		update: async (userId, id: number, input: UpdateInstallmentPlanInput) => {
			const row = await prisma.installmentPlan.update({
				where: { id, userId },
				data: input,
			})
			return toDomain(row)
		},
		deactivate: async (userId, id: number) => {
			const row = await prisma.installmentPlan.update({
				where: { id, userId },
				data: { active: false },
			})
			return toDomain(row)
		},
	}
}
