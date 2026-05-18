import type { RecurringItem } from '@/domain/entities/recurring-item'
import type {
	CreateRecurringItemInput,
	IRecurringItemRepository,
	UpdateRecurringItemInput,
} from '@/domain/repositories/IRecurringItemRepository'

function validateCreate(input: CreateRecurringItemInput): void {
	if (input.frequency === 'monthly') {
		if (input.billingDay == null) throw new Error('monthly item requires billingDay')
	} else {
		if (input.billingDay == null || input.billingMonth == null)
			throw new Error('annual item requires billingDay and billingMonth')
	}

	if (!input.isVariable && input.amountGs == null && input.amountUsd == null)
		throw new Error('non-variable item requires amountGs or amountUsd')
}

export function createRecurringItemService(repo: IRecurringItemRepository) {
	return {
		findAll: (): Promise<RecurringItem[]> => repo.findAll(),

		findById: async (id: number): Promise<RecurringItem> => {
			const item = await repo.findById(id)
			if (!item) throw new Error('RecurringItem not found')
			return item
		},

		findActive: (): Promise<RecurringItem[]> => repo.findActive(),

		create: async (input: CreateRecurringItemInput): Promise<RecurringItem> => {
			validateCreate(input)
			return repo.create(input)
		},

		update: async (id: number, input: UpdateRecurringItemInput): Promise<RecurringItem> => {
			const existing = await repo.findById(id)
			if (!existing) throw new Error('RecurringItem not found')
			return repo.update(id, input)
		},

		deactivate: async (id: number): Promise<RecurringItem> => {
			const existing = await repo.findById(id)
			if (!existing) throw new Error('RecurringItem not found')
			return repo.deactivate(id)
		},
	}
}
