import type { RecurringItem } from '@/domain/entities/recurring-item'
import type { RecurringItemSkip } from '@/domain/entities/recurring-item-skip'
import type {
	CreateRecurringItemInput,
	IRecurringItemRepository,
	UpdateRecurringItemInput,
} from '@/domain/repositories/IRecurringItemRepository'
import type { IRecurringItemSkipRepository } from '@/domain/repositories/IRecurringItemSkipRepository'

function validateCreate(input: CreateRecurringItemInput): void {
	if (input.frequency === 'monthly') {
		if (input.billingDay == null)
			throw new Error('monthly item requires billingDay')
	} else {
		if (input.billingDay == null || input.billingMonth == null)
			throw new Error('annual item requires billingDay and billingMonth')
	}

	if (!input.isVariable && input.amountGs == null && input.amountUsd == null)
		throw new Error('non-variable item requires amountGs or amountUsd')
}

export function createRecurringItemService(
	repo: IRecurringItemRepository,
	skipRepo: IRecurringItemSkipRepository,
) {
	return {
		findAll: (userId: string): Promise<RecurringItem[]> => repo.findAll(userId),

		findById: async (userId: string, id: number): Promise<RecurringItem> => {
			const item = await repo.findById(userId, id)
			if (!item) throw new Error('RecurringItem not found')
			return item
		},

		findActive: (userId: string): Promise<RecurringItem[]> =>
			repo.findActive(userId),

		create: async (
			userId: string,
			input: CreateRecurringItemInput,
		): Promise<RecurringItem> => {
			validateCreate(input)
			return repo.create(userId, input)
		},

		update: async (
			userId: string,
			id: number,
			input: UpdateRecurringItemInput,
		): Promise<RecurringItem> => {
			const existing = await repo.findById(userId, id)
			if (!existing) throw new Error('RecurringItem not found')
			return repo.update(userId, id, input)
		},

		deactivate: async (userId: string, id: number): Promise<RecurringItem> => {
			const existing = await repo.findById(userId, id)
			if (!existing) throw new Error('RecurringItem not found')
			return repo.deactivate(userId, id)
		},

		findSkipsByMonth: (
			userId: string,
			month: Date,
		): Promise<RecurringItemSkip[]> => skipRepo.findByMonth(userId, month),

		skipForMonth: async (
			userId: string,
			recurringItemId: number,
			month: Date,
			reason: string,
		): Promise<RecurringItemSkip> => {
			const item = await repo.findById(userId, recurringItemId)
			if (!item) throw new Error('RecurringItem not found')
			if (!item.active) throw new Error('Cannot skip an inactive item')
			return skipRepo.create(userId, { recurringItemId, month, reason })
		},

		unskipForMonth: async (
			userId: string,
			recurringItemId: number,
			month: Date,
		): Promise<void> => {
			await skipRepo.delete(userId, recurringItemId, month)
		},
	}
}
