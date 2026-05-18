import type { PrismaClient } from '@/generated/prisma/client'
import type { PaymentMethod, RecurringFrequency, RecurringItem } from '@/domain/entities/recurring-item'
import type {
	CreateRecurringItemInput,
	IRecurringItemRepository,
	UpdateRecurringItemInput,
} from '@/domain/repositories/IRecurringItemRepository'

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

export class PrismaRecurringItemRepository implements IRecurringItemRepository {
	constructor(private readonly prisma: PrismaClient) {}

	async findAll(): Promise<RecurringItem[]> {
		const rows = await this.prisma.recurringItem.findMany()
		return rows.map(toDomain)
	}

	async findById(id: number): Promise<RecurringItem | null> {
		const row = await this.prisma.recurringItem.findUnique({ where: { id } })
		return row ? toDomain(row) : null
	}

	async findActive(): Promise<RecurringItem[]> {
		const rows = await this.prisma.recurringItem.findMany({
			where: { active: true },
		})
		return rows.map(toDomain)
	}

	async create(input: CreateRecurringItemInput): Promise<RecurringItem> {
		const row = await this.prisma.recurringItem.create({ data: input })
		return toDomain(row)
	}

	async update(id: number, input: UpdateRecurringItemInput): Promise<RecurringItem> {
		const row = await this.prisma.recurringItem.update({ where: { id }, data: input })
		return toDomain(row)
	}

	async deactivate(id: number): Promise<RecurringItem> {
		const row = await this.prisma.recurringItem.update({ where: { id }, data: { active: false } })
		return toDomain(row)
	}
}
