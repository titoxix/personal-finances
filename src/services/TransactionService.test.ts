import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Transaction } from '@/domain/entities/transaction'
import type { ITransactionRepository } from '@/domain/repositories/ITransactionRepository'
import { createTransactionService } from './TransactionService'

const makeRepo = (): ITransactionRepository => ({
	findAll: vi.fn(),
	findById: vi.fn(),
	findByMonth: vi.fn(),
	findByMonthAndCategory: vi.fn(),
	create: vi.fn(),
	update: vi.fn(),
	delete: vi.fn(),
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
	notes: null,
	createdAt: new Date(),
	...overrides,
})

describe('createTransactionService', () => {
	let repo: ITransactionRepository
	let service: ReturnType<typeof createTransactionService>

	beforeEach(() => {
		repo = makeRepo()
		service = createTransactionService(repo)
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

			await expect(service.findById(999)).rejects.toThrow('Transaction not found')
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

			const result = await service.findByMonthAndCategory(new Date('2026-05-01'), 1)

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
			vi.mocked(repo.create).mockResolvedValue(makeTx({ weekOfMonth: expectedWeek }))

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

			await expect(service.update(999, { amountGs: 200000 })).rejects.toThrow('Transaction not found')
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
