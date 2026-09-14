import type { PaymentMethod } from '@/domain/entities/recurring-item'
import type { Transaction } from '@/domain/entities/transaction'

export type CreateTransactionInput = {
	date: Date
	description: string
	categoryId: number
	essentialityId: number
	paymentMethod: PaymentMethod
	amountGs?: number
	amountUsd?: number
	exchangeRateValue?: number
	exchangeRateId?: number
	weekOfMonth?: number
	isInstallment?: boolean
	installmentCurrent?: number
	installmentTotal?: number
	installmentPlanId?: number
	isRecurring?: boolean
	recurringItemId?: number
	notes?: string
}

export type UpdateTransactionInput = {
	date?: Date
	description?: string
	amountGs?: number | null
	amountUsd?: number | null
	exchangeRateValue?: number | null
	exchangeRateId?: number | null
	categoryId?: number
	essentialityId?: number
	paymentMethod?: PaymentMethod
	weekOfMonth?: number | null
	isInstallment?: boolean
	installmentCurrent?: number | null
	installmentTotal?: number | null
	installmentPlanId?: number | null
	isRecurring?: boolean
	recurringItemId?: number | null
	notes?: string | null
}

export interface ITransactionRepository {
	findAll(userId: string): Promise<Transaction[]>
	findById(userId: string, id: number): Promise<Transaction | null>
	findByMonth(userId: string, month: Date): Promise<Transaction[]>
	findByMonthAndCategory(
		userId: string,
		month: Date,
		categoryId: number,
	): Promise<Transaction[]>
	findByDateRange(
		userId: string,
		start: Date,
		end: Date,
	): Promise<Transaction[]>
	create(userId: string, input: CreateTransactionInput): Promise<Transaction>
	update(
		userId: string,
		id: number,
		input: UpdateTransactionInput,
	): Promise<Transaction>
	delete(userId: string, id: number): Promise<void>
}
