import type { PrismaClient } from '@/generated/prisma/client'
import type { InstallmentPlan } from '@/domain/entities/installment-plan'
import type { PaymentMethod } from '@/domain/entities/recurring-item'
import type {
	CreateInstallmentPlanInput,
	IInstallmentPlanRepository,
	UpdateInstallmentPlanInput,
} from '@/domain/repositories/IInstallmentPlanRepository'

type PrismaInstallmentPlan = {
	id: number
	description: string
	totalAmountGs: { toNumber(): number } | null
	totalAmountUsd: { toNumber(): number } | null
	installmentsTotal: number
	installmentsPaid: number
	installmentAmountGs: { toNumber(): number } | null
	startDate: Date
	endDate: Date | null
	paymentMethod: PaymentMethod
	categoryId: number
	essentialityId: number
	active: boolean
	notes: string | null
	createdAt: Date
}

function toDomain(raw: PrismaInstallmentPlan): InstallmentPlan {
	return {
		id: raw.id,
		description: raw.description,
		totalAmountGs: raw.totalAmountGs?.toNumber() ?? null,
		totalAmountUsd: raw.totalAmountUsd?.toNumber() ?? null,
		installmentsTotal: raw.installmentsTotal,
		installmentsPaid: raw.installmentsPaid,
		installmentAmountGs: raw.installmentAmountGs?.toNumber() ?? null,
		startDate: raw.startDate,
		endDate: raw.endDate,
		paymentMethod: raw.paymentMethod,
		categoryId: raw.categoryId,
		essentialityId: raw.essentialityId,
		active: raw.active,
		notes: raw.notes,
		createdAt: raw.createdAt,
	}
}

export class PrismaInstallmentPlanRepository implements IInstallmentPlanRepository {
	constructor(private readonly prisma: PrismaClient) {}

	async findAll(): Promise<InstallmentPlan[]> {
		const rows = await this.prisma.installmentPlan.findMany()
		return rows.map(toDomain)
	}

	async findById(id: number): Promise<InstallmentPlan | null> {
		const row = await this.prisma.installmentPlan.findUnique({ where: { id } })
		return row ? toDomain(row) : null
	}

	async findActive(): Promise<InstallmentPlan[]> {
		const rows = await this.prisma.installmentPlan.findMany({
			where: { active: true },
		})
		return rows.map(toDomain)
	}

	async create(input: CreateInstallmentPlanInput): Promise<InstallmentPlan> {
		const row = await this.prisma.installmentPlan.create({ data: input })
		return toDomain(row)
	}

	async update(id: number, input: UpdateInstallmentPlanInput): Promise<InstallmentPlan> {
		const row = await this.prisma.installmentPlan.update({ where: { id }, data: input })
		return toDomain(row)
	}

	async deactivate(id: number): Promise<InstallmentPlan> {
		const row = await this.prisma.installmentPlan.update({ where: { id }, data: { active: false } })
		return toDomain(row)
	}
}
