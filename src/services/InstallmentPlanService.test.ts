import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { InstallmentPlan } from '@/domain/entities/installment-plan'
import type { IInstallmentPlanRepository } from '@/domain/repositories/IInstallmentPlanRepository'
import { createInstallmentPlanService } from './InstallmentPlanService'

const makeRepo = (): IInstallmentPlanRepository => ({
	findAll: vi.fn(),
	findById: vi.fn(),
	findActive: vi.fn(),
	findActiveInDateRange: vi.fn(),
	create: vi.fn(),
	update: vi.fn(),
	deactivate: vi.fn(),
})

const makePlan = (
	overrides: Partial<InstallmentPlan> = {},
): InstallmentPlan => ({
	id: 1,
	description: 'iPhone 16',
	totalAmountGs: null,
	totalAmountUsd: 1200,
	installmentsTotal: 12,
	installmentsPaid: 0,
	installmentAmountGs: null,
	startDate: new Date('2026-01-01'),
	endDate: new Date('2027-01-01'),
	paymentMethod: 'itau_visa',
	categoryId: 1,
	essentialityId: 1,
	active: true,
	notes: null,
	createdAt: new Date(),
	...overrides,
})

describe('createInstallmentPlanService', () => {
	let repo: IInstallmentPlanRepository
	let service: ReturnType<typeof createInstallmentPlanService>

	beforeEach(() => {
		repo = makeRepo()
		service = createInstallmentPlanService(repo)
	})

	describe('findAll', () => {
		it('returns all plans from repository', async () => {
			const plans = [makePlan()]
			vi.mocked(repo.findAll).mockResolvedValue(plans)

			const result = await service.findAll()

			expect(result).toBe(plans)
			expect(repo.findAll).toHaveBeenCalledOnce()
		})
	})

	describe('findById', () => {
		it('returns the plan when it exists', async () => {
			const plan = makePlan()
			vi.mocked(repo.findById).mockResolvedValue(plan)

			const result = await service.findById(1)

			expect(result).toBe(plan)
		})

		it('throws when plan does not exist', async () => {
			vi.mocked(repo.findById).mockResolvedValue(null)

			await expect(service.findById(999)).rejects.toThrow(
				'InstallmentPlan not found',
			)
		})
	})

	describe('findActive', () => {
		it('returns active plans from repository', async () => {
			const plans = [makePlan()]
			vi.mocked(repo.findActive).mockResolvedValue(plans)

			const result = await service.findActive()

			expect(result).toBe(plans)
			expect(repo.findActive).toHaveBeenCalledOnce()
		})
	})

	describe('create', () => {
		it('calculates endDate from startDate + installmentsTotal months', async () => {
			const plan = makePlan()
			vi.mocked(repo.create).mockResolvedValue(plan)

			await service.create({
				description: 'iPhone 16',
				installmentsTotal: 12,
				startDate: new Date('2026-01-01'),
				paymentMethod: 'itau_visa',
				categoryId: 1,
				essentialityId: 1,
				totalAmountUsd: 1200,
			})

			expect(repo.create).toHaveBeenCalledWith(
				expect.objectContaining({
					endDate: new Date('2027-01-01'),
				}),
			)
		})

		it('does not override endDate when caller provides it', async () => {
			const plan = makePlan({ endDate: new Date('2026-06-01') })
			vi.mocked(repo.create).mockResolvedValue(plan)

			await service.create({
				description: 'iPhone 16',
				installmentsTotal: 12,
				startDate: new Date('2026-01-01'),
				endDate: new Date('2026-06-01'),
				paymentMethod: 'itau_visa',
				categoryId: 1,
				essentialityId: 1,
			})

			expect(repo.create).toHaveBeenCalledWith(
				expect.objectContaining({
					endDate: new Date('2026-06-01'),
				}),
			)
		})

		it('handles month overflow correctly (e.g. 6 months from Aug)', async () => {
			const plan = makePlan({
				startDate: new Date('2026-08-01'),
				endDate: new Date('2027-02-01'),
			})
			vi.mocked(repo.create).mockResolvedValue(plan)

			await service.create({
				description: 'Test',
				installmentsTotal: 6,
				startDate: new Date('2026-08-01'),
				paymentMethod: 'itau_visa',
				categoryId: 1,
				essentialityId: 1,
			})

			expect(repo.create).toHaveBeenCalledWith(
				expect.objectContaining({
					endDate: new Date('2027-02-01'),
				}),
			)
		})

		it('throws when installmentsTotal is less than 1', async () => {
			await expect(
				service.create({
					description: 'iPhone 16',
					installmentsTotal: 0,
					startDate: new Date('2026-01-01'),
					paymentMethod: 'itau_visa',
					categoryId: 1,
					essentialityId: 1,
				}),
			).rejects.toThrow('installmentsTotal must be at least 1')
		})
	})

	describe('update', () => {
		it('updates and returns the plan', async () => {
			const existing = makePlan()
			const updated = makePlan({ installmentsPaid: 3 })
			vi.mocked(repo.findById).mockResolvedValue(existing)
			vi.mocked(repo.update).mockResolvedValue(updated)

			const result = await service.update(1, { installmentsPaid: 3 })

			expect(result).toBe(updated)
			expect(repo.update).toHaveBeenCalledWith(1, { installmentsPaid: 3 })
		})

		it('throws when plan does not exist', async () => {
			vi.mocked(repo.findById).mockResolvedValue(null)

			await expect(
				service.update(999, { installmentsPaid: 3 }),
			).rejects.toThrow('InstallmentPlan not found')
		})
	})

	describe('deactivate', () => {
		it('deactivates and returns the plan', async () => {
			const existing = makePlan()
			const deactivated = makePlan({ active: false })
			vi.mocked(repo.findById).mockResolvedValue(existing)
			vi.mocked(repo.deactivate).mockResolvedValue(deactivated)

			const result = await service.deactivate(1)

			expect(result).toBe(deactivated)
			expect(repo.deactivate).toHaveBeenCalledWith(1)
		})

		it('throws when plan does not exist', async () => {
			vi.mocked(repo.findById).mockResolvedValue(null)

			await expect(service.deactivate(999)).rejects.toThrow(
				'InstallmentPlan not found',
			)
		})
	})
})
