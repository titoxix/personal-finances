import type {
	PaymentMethod,
	RecurringFrequency,
	RecurringItem,
} from '@/domain/entities/recurring-item'

export type CreateRecurringItemInput = {
	description: string
	categoryId: number
	essentialityId: number
	paymentMethod: PaymentMethod
	frequency: RecurringFrequency
	amountGs?: number
	amountUsd?: number
	billingDay?: number
	billingMonth?: number
	isVariable?: boolean
	notes?: string
}

export type UpdateRecurringItemInput = {
	description?: string
	amountGs?: number | null
	amountUsd?: number | null
	categoryId?: number
	essentialityId?: number
	paymentMethod?: PaymentMethod
	frequency?: RecurringFrequency
	billingDay?: number | null
	billingMonth?: number | null
	isVariable?: boolean
	notes?: string | null
}

export interface IRecurringItemRepository {
	findAll(): Promise<RecurringItem[]>
	findById(id: number): Promise<RecurringItem | null>
	findActive(): Promise<RecurringItem[]>
	create(input: CreateRecurringItemInput): Promise<RecurringItem>
	update(id: number, input: UpdateRecurringItemInput): Promise<RecurringItem>
	deactivate(id: number): Promise<RecurringItem>
}
