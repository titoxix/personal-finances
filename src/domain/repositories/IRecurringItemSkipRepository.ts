import type { RecurringItemSkip } from '@/domain/entities/recurring-item-skip'

export type CreateRecurringItemSkipInput = {
	recurringItemId: number
	month: Date
	reason: string
}

export interface IRecurringItemSkipRepository {
	findByMonth(userId: string, month: Date): Promise<RecurringItemSkip[]>
	create(
		userId: string,
		input: CreateRecurringItemSkipInput,
	): Promise<RecurringItemSkip>
	delete(userId: string, recurringItemId: number, month: Date): Promise<void>
}
