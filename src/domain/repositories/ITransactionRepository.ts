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
	notes?: string | null
}

export interface ITransactionRepository {
	findAll(): Promise<Transaction[]>
	findById(id: number): Promise<Transaction | null>
	findByMonth(month: Date): Promise<Transaction[]>
	findByMonthAndCategory(
		month: Date,
		categoryId: number,
	): Promise<Transaction[]>
	create(input: CreateTransactionInput): Promise<Transaction>
	update(id: number, input: UpdateTransactionInput): Promise<Transaction>
	delete(id: number): Promise<void>
}
