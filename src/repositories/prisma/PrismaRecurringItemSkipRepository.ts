import type { RecurringItemSkip } from '@/domain/entities/recurring-item-skip'
import type {
	CreateRecurringItemSkipInput,
	IRecurringItemSkipRepository,
} from '@/domain/repositories/IRecurringItemSkipRepository'
import type { PrismaClient } from '@/generated/prisma/client'

type PrismaRecurringItemSkip = {
	id: number
	recurringItemId: number
	month: Date
	reason: string
	createdAt: Date
}

function toDomain(raw: PrismaRecurringItemSkip): RecurringItemSkip {
	return {
		id: raw.id,
		recurringItemId: raw.recurringItemId,
		month: raw.month,
		reason: raw.reason,
		createdAt: raw.createdAt,
	}
}

export function createPrismaRecurringItemSkipRepository(
	prisma: PrismaClient,
): IRecurringItemSkipRepository {
	return {
		findByMonth: async (month) => {
			const rows = await prisma.recurringItemSkip.findMany({
				where: { month },
			})
			return rows.map(toDomain)
		},
		create: async (input: CreateRecurringItemSkipInput) => {
			const row = await prisma.recurringItemSkip.create({ data: input })
			return toDomain(row)
		},
		delete: async (recurringItemId: number, month: Date) => {
			await prisma.recurringItemSkip.delete({
				where: {
					recurringItemId_month: { recurringItemId, month },
				},
			})
		},
	}
}
