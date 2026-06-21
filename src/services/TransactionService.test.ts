import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { InstallmentPlan } from '@/domain/entities/installment-plan'
import type { Transaction } from '@/domain/entities/transaction'
import type { IInstallmentPlanRepository } from '@/domain/repositories/IInstallmentPlanRepository'
import type { ITransactionRepository } from '@/domain/repositories/ITransactionRepository'
import { createTransactionService } from './TransactionService'

const makeRepo = (): ITransactionRepository => ({
	findAll: vi.fn(),
	findById: vi.fn(),
	findByMonth: vi.fn(),
	findByMonthAndCategory: vi.fn(),
	findByDateRange: vi.fn(),
	create: vi.fn(),
	update: vi.fn(),
	delete: vi.fn(),
})

const makeInstallmentPlanRepo = (): IInstallmentPlanRepository => ({
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
	installmentsPaid: 3,
	installmentAmountGs: 750000,
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

const makeTx = (overrides: Partial<Transaction> = {}): Transaction => ({
	id: 1,
	date: new Date('2026-05-10'),
	description: 'Supermercado',
	amountGs: 150000,
	amountUsd: null,
	exchangeRateValue: null,
	exchangeRateId: null,
	categoryId: 1,
	essentialityId: 1,
	paymentMethod: 'itau_debito',
	weekOfMonth: 2,
	isInstallment: false,
	installmentCurrent: null,
	installmentTotal: null,
	installmentPlanId: null,
	isRecurring: false,
	recurringItemId: null,
	notes: null,
	createdAt: new Date(),
	...overrides,
})

describe('createTransactionService', () => {
	let repo: ITransactionRepository
	let installmentPlanRepo: IInstallmentPlanRepository
	let service: ReturnType<typeof createTransactionService>

	beforeEach(() => {
		repo = makeRepo()
		installmentPlanRepo = makeInstallmentPlanRepo()
		service = createTransactionService(repo, installmentPlanRepo)
	})

	describe('findAll', () => {
		it('returns all transactions from repository', async () => {
			const txs = [makeTx()]
			vi.mocked(repo.findAll).mockResolvedValue(txs)

			const result = await service.findAll()

			expect(result).toBe(txs)
			expect(repo.findAll).toHaveBeenCalledOnce()
		})
	})

	describe('findById', () => {
		it('returns the transaction when it exists', async () => {
			const tx = makeTx()
			vi.mocked(repo.findById).mockResolvedValue(tx)

			const result = await service.findById(1)

			expect(result).toBe(tx)
		})

		it('throws when transaction does not exist', async () => {
			vi.mocked(repo.findById).mockResolvedValue(null)

			await expect(service.findById(999)).rejects.toThrow(
				'Transaction not found',
			)
		})
	})

	describe('findByMonth', () => {
		it('returns transactions for the given month', async () => {
			const txs = [makeTx()]
			vi.mocked(repo.findByMonth).mockResolvedValue(txs)

			const result = await service.findByMonth(new Date('2026-05-01'))

			expect(result).toBe(txs)
		})
	})

	describe('findByMonthAndCategory', () => {
		it('returns transactions for the given month and category', async () => {
			const txs = [makeTx()]
			vi.mocked(repo.findByMonthAndCategory).mockResolvedValue(txs)

			const result = await service.findByMonthAndCategory(
				new Date('2026-05-01'),
				1,
			)

			expect(result).toBe(txs)
		})
	})

	describe('create — weekOfMonth calculation', () => {
		it.each([
			[1, 1],
			[7, 1],
			[8, 2],
			[14, 2],
			[15, 3],
			[21, 3],
			[22, 4],
			[31, 4],
		])('day %i → weekOfMonth %i', async (day, expectedWeek) => {
			vi.mocked(repo.create).mockResolvedValue(
				makeTx({ weekOfMonth: expectedWeek }),
			)

			await service.create({
				date: new Date(`2026-05-${String(day).padStart(2, '0')}`),
				description: 'Test',
				categoryId: 1,
				essentialityId: 1,
				paymentMethod: 'itau_debito',
				amountGs: 100000,
			})

			expect(repo.create).toHaveBeenCalledWith(
				expect.objectContaining({ weekOfMonth: expectedWeek }),
			)
		})

		it('does not override weekOfMonth when caller provides it', async () => {
			vi.mocked(repo.create).mockResolvedValue(makeTx({ weekOfMonth: 1 }))

			await service.create({
				date: new Date('2026-05-25'),
				description: 'Test',
				categoryId: 1,
				essentialityId: 1,
				paymentMethod: 'itau_debito',
				amountGs: 100000,
				weekOfMonth: 1,
			})

			expect(repo.create).toHaveBeenCalledWith(
				expect.objectContaining({ weekOfMonth: 1 }),
			)
		})

		it('throws when neither amountGs nor amountUsd is provided', async () => {
			await expect(
				service.create({
					date: new Date('2026-05-10'),
					description: 'Test',
					categoryId: 1,
					essentialityId: 1,
					paymentMethod: 'itau_debito',
				}),
			).rejects.toThrow('transaction requires amountGs or amountUsd')
		})

		it('sets isRecurring to true automatically when recurringItemId is provided', async () => {
			vi.mocked(repo.create).mockResolvedValue(
				makeTx({ isRecurring: true, recurringItemId: 5 }),
			)

			await service.create({
				date: new Date('2026-05-10'),
				description: 'Alquiler',
				categoryId: 1,
				essentialityId: 1,
				paymentMethod: 'transferencia',
				amountGs: 7000000,
				recurringItemId: 5,
			})

			expect(repo.create).toHaveBeenCalledWith(
				expect.objectContaining({ isRecurring: true, recurringItemId: 5 }),
			)
		})

		it('passes recurringItemId through to the repository', async () => {
			vi.mocked(repo.create).mockResolvedValue(makeTx({ recurringItemId: 3 }))

			await service.create({
				date: new Date('2026-05-10'),
				description: 'Test',
				categoryId: 1,
				essentialityId: 1,
				paymentMethod: 'itau_debito',
				amountGs: 100000,
				recurringItemId: 3,
			})

			expect(repo.create).toHaveBeenCalledWith(
				expect.objectContaining({ recurringItemId: 3 }),
			)
		})
	})

	describe('create — installment plan linking', () => {
		it('fills isInstallment, installmentCurrent and installmentTotal from the plan', async () => {
			const plan = makePlan({
				id: 7,
				installmentsPaid: 3,
				installmentsTotal: 12,
			})
			vi.mocked(installmentPlanRepo.findById).mockResolvedValue(plan)
			vi.mocked(repo.create).mockResolvedValue(makeTx({ installmentPlanId: 7 }))

			await service.create({
				date: new Date('2026-05-10'),
				description: 'Cuota iPhone',
				categoryId: 1,
				essentialityId: 1,
				paymentMethod: 'itau_visa',
				amountGs: 750000,
				installmentPlanId: 7,
			})

			expect(repo.create).toHaveBeenCalledWith(
				expect.objectContaining({
					installmentPlanId: 7,
					isInstallment: true,
					installmentCurrent: 4,
					installmentTotal: 12,
				}),
			)
		})

		it('increments installmentsPaid on the linked plan after creating the transaction', async () => {
			const plan = makePlan({
				id: 7,
				installmentsPaid: 3,
				installmentsTotal: 12,
			})
			vi.mocked(installmentPlanRepo.findById).mockResolvedValue(plan)
			vi.mocked(repo.create).mockResolvedValue(makeTx({ installmentPlanId: 7 }))

			await service.create({
				date: new Date('2026-05-10'),
				description: 'Cuota iPhone',
				categoryId: 1,
				essentialityId: 1,
				paymentMethod: 'itau_visa',
				amountGs: 750000,
				installmentPlanId: 7,
			})

			expect(installmentPlanRepo.update).toHaveBeenCalledWith(7, {
				installmentsPaid: 4,
			})
		})

		it('throws when the linked installment plan does not exist', async () => {
			vi.mocked(installmentPlanRepo.findById).mockResolvedValue(null)

			await expect(
				service.create({
					date: new Date('2026-05-10'),
					description: 'Cuota iPhone',
					categoryId: 1,
					essentialityId: 1,
					paymentMethod: 'itau_visa',
					amountGs: 750000,
					installmentPlanId: 99,
				}),
			).rejects.toThrow('InstallmentPlan not found')

			expect(repo.create).not.toHaveBeenCalled()
		})

		it('does not touch the installment plan repository when no plan is linked', async () => {
			vi.mocked(repo.create).mockResolvedValue(makeTx())

			await service.create({
				date: new Date('2026-05-10'),
				description: 'Test',
				categoryId: 1,
				essentialityId: 1,
				paymentMethod: 'itau_debito',
				amountGs: 100000,
			})

			expect(installmentPlanRepo.findById).not.toHaveBeenCalled()
			expect(installmentPlanRepo.update).not.toHaveBeenCalled()
		})
	})

	describe('update', () => {
		it('updates and returns the transaction', async () => {
			const existing = makeTx()
			const updated = makeTx({ amountGs: 200000 })
			vi.mocked(repo.findById).mockResolvedValue(existing)
			vi.mocked(repo.update).mockResolvedValue(updated)

			const result = await service.update(1, { amountGs: 200000 })

			expect(result).toBe(updated)
			expect(repo.update).toHaveBeenCalledWith(1, { amountGs: 200000 })
		})

		it('throws when transaction does not exist', async () => {
			vi.mocked(repo.findById).mockResolvedValue(null)

			await expect(service.update(999, { amountGs: 200000 })).rejects.toThrow(
				'Transaction not found',
			)
		})

		it('can unlink a recurringItemId by passing null', async () => {
			const existing = makeTx({ recurringItemId: 5, isRecurring: true })
			const updated = makeTx({ recurringItemId: null, isRecurring: true })
			vi.mocked(repo.findById).mockResolvedValue(existing)
			vi.mocked(repo.update).mockResolvedValue(updated)

			await service.update(1, { recurringItemId: null })

			expect(repo.update).toHaveBeenCalledWith(1, { recurringItemId: null })
		})
	})

	describe('delete', () => {
		it('deletes the transaction', async () => {
			vi.mocked(repo.findById).mockResolvedValue(makeTx())
			vi.mocked(repo.delete).mockResolvedValue(undefined)

			await service.delete(1)

			expect(repo.delete).toHaveBeenCalledWith(1)
		})

		it('throws when transaction does not exist', async () => {
			vi.mocked(repo.findById).mockResolvedValue(null)

			await expect(service.delete(999)).rejects.toThrow('Transaction not found')
		})
	})
})
