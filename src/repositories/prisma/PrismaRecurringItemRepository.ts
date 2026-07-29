import type {
	PaymentMethod,
	RecurringFrequency,
	RecurringItem,
} from '@/domain/entities/recurring-item'
import type {
	CreateRecurringItemInput,
	IRecurringItemRepository,
	UpdateRecurringItemInput,
} from '@/domain/repositories/IRecurringItemRepository'
import type { PrismaClient } from '@/generated/prisma/client'

type PrismaRecurringItem = {
	id: number
	description: string
	amountGs: { toNumber(): number } | null
	amountUsd: { toNumber(): number } | null
	categoryId: number
	essentialityId: number
	paymentMethod: PaymentMethod
	frequency: RecurringFrequency
	billingDay: number | null
	billingMonth: number | null
	isVariable: boolean
	active: boolean
	notes: string | null
	createdAt: Date
}

function toDomain(raw: PrismaRecurringItem): RecurringItem {
	return {
		id: raw.id,
		description: raw.description,
		amountGs: raw.amountGs?.toNumber() ?? null,
		amountUsd: raw.amountUsd?.toNumber() ?? null,
		categoryId: raw.categoryId,
		essentialityId: raw.essentialityId,
		paymentMethod: raw.paymentMethod,
		frequency: raw.frequency,
		billingDay: raw.billingDay,
		billingMonth: raw.billingMonth,
		isVariable: raw.isVariable,
		active: raw.active,
		notes: raw.notes,
		createdAt: raw.createdAt,
	}
}

export function createPrismaRecurringItemRepository(
	prisma: PrismaClient,
): IRecurringItemRepository {
	return {
		findAll: async (userId) => {
			const rows = await prisma.recurringItem.findMany({ where: { userId } })
			return rows.map(toDomain)
		},
		findById: async (userId, id) => {
			const row = await prisma.recurringItem.findUnique({
				where: { id, userId },
			})
			return row ? toDomain(row) : null
		},
		findActive: async (userId) => {
			const rows = await prisma.recurringItem.findMany({
				where: { userId, active: true },
			})
			return rows.map(toDomain)
		},
		create: async (userId, input: CreateRecurringItemInput) => {
			const row = await prisma.recurringItem.create({
				data: { ...input, userId },
			})
			return toDomain(row)
		},
		update: async (userId, id: number, input: UpdateRecurringItemInput) => {
			const row = await prisma.recurringItem.update({
				where: { id, userId },
				data: input,
			})
			return toDomain(row)
		},
		deactivate: async (userId, id: number) => {
			const row = await prisma.recurringItem.update({
				where: { id, userId },
				data: { active: false },
			})
			return toDomain(row)
		},
	}
}
