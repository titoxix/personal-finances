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
		findByMonth: async (userId, month) => {
			const rows = await prisma.recurringItemSkip.findMany({
				where: { month, recurringItem: { userId } },
			})
			return rows.map(toDomain)
		},
		create: async (userId, input: CreateRecurringItemSkipInput) => {
			const owned = await prisma.recurringItem.findUnique({
				where: { id: input.recurringItemId, userId },
				select: { id: true },
			})
			if (!owned) throw new Error('RecurringItem not found')
			const row = await prisma.recurringItemSkip.create({ data: input })
			return toDomain(row)
		},
		delete: async (userId, recurringItemId: number, month: Date) => {
			const result = await prisma.recurringItemSkip.deleteMany({
				where: { recurringItemId, month, recurringItem: { userId } },
			})
			if (result.count === 0) throw new Error('RecurringItemSkip not found')
		},
	}
}
