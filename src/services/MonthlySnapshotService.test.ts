import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { MonthlySnapshot } from '@/domain/entities/monthly-snapshot'
import type { IMonthlySnapshotRepository } from '@/domain/repositories/IMonthlySnapshotRepository'
import { createMonthlySnapshotService } from './MonthlySnapshotService'

const makeRepo = (): IMonthlySnapshotRepository => ({
	findAll: vi.fn(),
	findById: vi.fn(),
	findByMonth: vi.fn(),
	findLatest: vi.fn(),
	create: vi.fn(),
	update: vi.fn(),
})

const MAY_2026 = new Date('2026-05-01')

const makeSnapshot = (
	overrides: Partial<MonthlySnapshot> = {},
): MonthlySnapshot => ({
	id: 1,
	month: MAY_2026,
	incomeUsd: 3000,
	exchangeRateValue: 7800,
	exchangeRateId: 1,
	balanceItauUsd: 5000,
	balanceItauGs: null,
	balanceUenoUsd: null,
	balanceUenoGs: null,
	balanceMangoGs: null,
	balanceGnbGs: null,
	gnbCardGs: null,
	investorFundUsd: 10000,
	investorFundGs: null,
	investorReturnPct: 8.5,
	etfPortfolioUsd: 3000,
	etfReturnPct: 12.3,
	itauCardGs: null,
	uenoCardGs: null,
	pendingInstallmentsGs: null,
	netWorthUsd: 18000,
	totalInvestedUsd: 13000,
	totalDebtUsd: null,
	savingsRatePct: 40,
	notes: null,
	createdAt: new Date(),
	...overrides,
})

describe('createMonthlySnapshotService', () => {
	let repo: IMonthlySnapshotRepository
	let service: ReturnType<typeof createMonthlySnapshotService>

	beforeEach(() => {
		repo = makeRepo()
		service = createMonthlySnapshotService(repo)
	})

	describe('findAll', () => {
		it('returns all snapshots from repository', async () => {
			const snapshots = [makeSnapshot()]
			vi.mocked(repo.findAll).mockResolvedValue(snapshots)

			const result = await service.findAll()

			expect(result).toBe(snapshots)
			expect(repo.findAll).toHaveBeenCalledOnce()
		})
	})

	describe('findById', () => {
		it('returns the snapshot when it exists', async () => {
			const snapshot = makeSnapshot()
			vi.mocked(repo.findById).mockResolvedValue(snapshot)

			const result = await service.findById(1)

			expect(result).toBe(snapshot)
		})

		it('throws when snapshot does not exist', async () => {
			vi.mocked(repo.findById).mockResolvedValue(null)

			await expect(service.findById(999)).rejects.toThrow(
				'MonthlySnapshot not found',
			)
		})
	})

	describe('findByMonth', () => {
		it('returns the snapshot for the given month', async () => {
			const snapshot = makeSnapshot()
			vi.mocked(repo.findByMonth).mockResolvedValue(snapshot)

			const result = await service.findByMonth(MAY_2026)

			expect(result).toBe(snapshot)
			expect(repo.findByMonth).toHaveBeenCalledWith(MAY_2026)
		})

		it('returns null when no snapshot exists for the month', async () => {
			vi.mocked(repo.findByMonth).mockResolvedValue(null)

			const result = await service.findByMonth(MAY_2026)

			expect(result).toBeNull()
		})
	})

	describe('findLatest', () => {
		it('returns the most recent snapshot', async () => {
			const snapshot = makeSnapshot()
			vi.mocked(repo.findLatest).mockResolvedValue(snapshot)

			const result = await service.findLatest()

			expect(result).toBe(snapshot)
		})

		it('returns null when no snapshots exist', async () => {
			vi.mocked(repo.findLatest).mockResolvedValue(null)

			const result = await service.findLatest()

			expect(result).toBeNull()
		})
	})

	describe('create', () => {
		it('creates and returns the new snapshot', async () => {
			const snapshot = makeSnapshot()
			vi.mocked(repo.findByMonth).mockResolvedValue(null)
			vi.mocked(repo.create).mockResolvedValue(snapshot)

			const result = await service.create({ month: MAY_2026, incomeUsd: 3000 })

			expect(result).toBe(snapshot)
			expect(repo.create).toHaveBeenCalledWith({
				month: MAY_2026,
				incomeUsd: 3000,
			})
		})

		it('throws when a snapshot already exists for the month', async () => {
			vi.mocked(repo.findByMonth).mockResolvedValue(makeSnapshot())

			await expect(service.create({ month: MAY_2026 })).rejects.toThrow(
				'MonthlySnapshot already exists for this month',
			)
		})
	})

	describe('update', () => {
		it('updates and returns the snapshot', async () => {
			const existing = makeSnapshot()
			const updated = makeSnapshot({ netWorthUsd: 19000 })
			vi.mocked(repo.findById).mockResolvedValue(existing)
			vi.mocked(repo.update).mockResolvedValue(updated)

			const result = await service.update(1, { netWorthUsd: 19000 })

			expect(result).toBe(updated)
			expect(repo.update).toHaveBeenCalledWith(1, { netWorthUsd: 19000 })
		})

		it('throws when snapshot does not exist', async () => {
			vi.mocked(repo.findById).mockResolvedValue(null)

			await expect(service.update(999, { netWorthUsd: 19000 })).rejects.toThrow(
				'MonthlySnapshot not found',
			)
		})
	})
})
