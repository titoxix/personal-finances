import type { RecurringItemSkip } from '@/domain/entities/recurring-item-skip'

export type CreateRecurringItemSkipInput = {
	recurringItemId: number
	month: Date
	reason: string
}

export interface IRecurringItemSkipRepository {
	findByMonth(month: Date): Promise<RecurringItemSkip[]>
	create(input: CreateRecurringItemSkipInput): Promise<RecurringItemSkip>
	delete(recurringItemId: number, month: Date): Promise<void>
}
