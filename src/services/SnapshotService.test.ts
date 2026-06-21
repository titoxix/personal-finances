import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Snapshot } from '@/domain/entities/snapshot'
import type { ISnapshotRepository } from '@/domain/repositories/ISnapshotRepository'
import { createSnapshotService } from './SnapshotService'

const makeRepo = (): ISnapshotRepository => ({
	findAll: vi.fn(),
	findById: vi.fn(),
	findLatest: vi.fn(),
	findByDateRange: vi.fn(),
	create: vi.fn(),
	update: vi.fn(),
})

const MAY_15 = new Date('2026-05-15')

const makeSnapshot = (overrides: Partial<Snapshot> = {}): Snapshot => ({
	id: 1,
	date: MAY_15,
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
	itauCardGs: null,
	uenoCardGs: null,
	pendingInstallmentsGs: null,
	netWorthUsd: 18000,
	totalInvestedUsd: 13000,
	totalDebtUsd: null,
	savingsRatePct: 40,
	notes: null,
	createdAt: new Date(),
	investments: [],
	...overrides,
})

describe('createSnapshotService', () => {
	let repo: ISnapshotRepository
	let service: ReturnType<typeof createSnapshotService>

	beforeEach(() => {
		repo = makeRepo()
		service = createSnapshotService(repo)
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

			await expect(service.findById(999)).rejects.toThrow('Snapshot not found')
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
			vi.mocked(repo.findLatest).mockResolvedValue(null)
			vi.mocked(repo.create).mockResolvedValue(snapshot)

			const result = await service.create({ date: MAY_15, incomeUsd: 3000 })

			expect(result).toBe(snapshot)
			expect(repo.create).toHaveBeenCalledOnce()
		})

		it('allows multiple snapshots for the same date', async () => {
			const snapshot = makeSnapshot()
			vi.mocked(repo.findLatest).mockResolvedValue(makeSnapshot({ id: 2 }))
			vi.mocked(repo.create).mockResolvedValue(snapshot)

			const result = await service.create({ date: MAY_15 })

			expect(result).toBe(snapshot)
			expect(repo.create).toHaveBeenCalledOnce()
		})

		it('passes investments to the repository', async () => {
			const investments = [
				{ name: 'Investor', currency: 'USD' as const, value: 10000 },
			]
			vi.mocked(repo.findLatest).mockResolvedValue(null)
			vi.mocked(repo.create).mockResolvedValue(makeSnapshot())

			await service.create({ date: MAY_15, investments })

			expect(repo.create).toHaveBeenCalledWith(
				expect.objectContaining({ investments }),
			)
		})
	})

	describe('update', () => {
		it('updates and returns the snapshot', async () => {
			const existing = makeSnapshot()
			const updated = makeSnapshot({ incomeUsd: 3500 })
			vi.mocked(repo.findById).mockResolvedValue(existing)
			vi.mocked(repo.findLatest).mockResolvedValue(existing)
			vi.mocked(repo.update).mockResolvedValue(updated)

			const result = await service.update(1, { incomeUsd: 3500 })

			expect(result).toBe(updated)
			expect(repo.update).toHaveBeenCalledWith(
				1,
				expect.objectContaining({ incomeUsd: 3500 }),
			)
		})

		it('throws when snapshot does not exist', async () => {
			vi.mocked(repo.findById).mockResolvedValue(null)
			vi.mocked(repo.findLatest).mockResolvedValue(null)

			await expect(service.update(999, { incomeUsd: 3500 })).rejects.toThrow(
				'Snapshot not found',
			)
		})
	})

	describe('derived metrics calculation', () => {
		const fullInput = {
			date: MAY_15,
			incomeUsd: 1000,
			exchangeRateValue: 7800,
			balanceItauUsd: 5000,
			balanceItauGs: 7800000,
			balanceUenoUsd: 2000,
			balanceUenoGs: 0,
			balanceMangoGs: 0,
			balanceGnbGs: 0,
			gnbCardGs: 0,
			itauCardGs: 780000,
			uenoCardGs: 780000,
			pendingInstallmentsGs: 0,
			investments: [
				{ name: 'ETF Portfolio', currency: 'USD' as const, value: 3000 },
				{ name: 'Investor Fund USD', currency: 'USD' as const, value: 8000 },
				{ name: 'Investor Fund GS', currency: 'GS' as const, value: 7800000 },
			],
		}

		it('computes correct derived values when all fields are present', async () => {
			const previousSnapshot = makeSnapshot({ id: 2, totalInvestedUsd: 10000 })
			vi.mocked(repo.findLatest).mockResolvedValue(previousSnapshot)
			vi.mocked(repo.create).mockResolvedValue(makeSnapshot())

			await service.create(fullInput)

			expect(repo.create).toHaveBeenCalledWith(
				expect.objectContaining({
					totalDebtUsd: 200,
					totalInvestedUsd: 12000,
					netWorthUsd: 19800,
					savingsRatePct: 200,
				}),
			)
		})

		it('returns null for all derived fields when exchangeRateValue is null', async () => {
			vi.mocked(repo.findLatest).mockResolvedValue(makeSnapshot({ id: 2 }))
			vi.mocked(repo.create).mockResolvedValue(makeSnapshot())

			await service.create({ date: MAY_15, incomeUsd: 1000 })

			expect(repo.create).toHaveBeenCalledWith(
				expect.objectContaining({
					netWorthUsd: undefined,
					totalInvestedUsd: undefined,
					totalDebtUsd: undefined,
					savingsRatePct: undefined,
				}),
			)
		})

		it('returns null for all derived fields when exchangeRateValue is 0', async () => {
			const existing = makeSnapshot({ exchangeRateValue: 0 })
			vi.mocked(repo.findById).mockResolvedValue(existing)
			vi.mocked(repo.findLatest).mockResolvedValue(makeSnapshot({ id: 2 }))
			vi.mocked(repo.update).mockResolvedValue(makeSnapshot())

			await service.update(1, {})

			expect(repo.update).toHaveBeenCalledWith(
				1,
				expect.objectContaining({
					netWorthUsd: null,
					totalInvestedUsd: null,
					totalDebtUsd: null,
					savingsRatePct: null,
				}),
			)
		})

		it('returns null savingsRatePct when incomeUsd is null', async () => {
			vi.mocked(repo.findLatest).mockResolvedValue(
				makeSnapshot({ id: 2, totalInvestedUsd: 10000 }),
			)
			vi.mocked(repo.create).mockResolvedValue(makeSnapshot())

			await service.create({ ...fullInput, incomeUsd: undefined })

			expect(repo.create).toHaveBeenCalledWith(
				expect.objectContaining({ savingsRatePct: undefined }),
			)
		})

		it('returns null savingsRatePct when incomeUsd is 0', async () => {
			const existing = makeSnapshot({ incomeUsd: 0, exchangeRateValue: 7800 })
			vi.mocked(repo.findById).mockResolvedValue(existing)
			vi.mocked(repo.findLatest).mockResolvedValue(
				makeSnapshot({ id: 2, totalInvestedUsd: 10000 }),
			)
			vi.mocked(repo.update).mockResolvedValue(makeSnapshot())

			await service.update(1, {})

			expect(repo.update).toHaveBeenCalledWith(
				1,
				expect.objectContaining({ savingsRatePct: null }),
			)
		})

		it('returns null savingsRatePct when no previous snapshot exists', async () => {
			vi.mocked(repo.findLatest).mockResolvedValue(null)
			vi.mocked(repo.create).mockResolvedValue(makeSnapshot())

			await service.create(fullInput)

			expect(repo.create).toHaveBeenCalledWith(
				expect.objectContaining({ savingsRatePct: undefined }),
			)
		})
	})
})
