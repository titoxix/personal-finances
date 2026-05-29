import type { MonthlySnapshot } from '@/domain/entities/monthly-snapshot'
import type {
	CreateMonthlySnapshotInput,
	IMonthlySnapshotRepository,
	UpdateMonthlySnapshotInput,
} from '@/domain/repositories/IMonthlySnapshotRepository'

export function createMonthlySnapshotService(repo: IMonthlySnapshotRepository) {
	return {
		findAll: (): Promise<MonthlySnapshot[]> => repo.findAll(),

		findById: async (id: number): Promise<MonthlySnapshot> => {
			const snapshot = await repo.findById(id)
			if (!snapshot) throw new Error('MonthlySnapshot not found')
			return snapshot
		},

		findByMonth: (month: Date): Promise<MonthlySnapshot | null> =>
			repo.findByMonth(month),

		findLatest: (): Promise<MonthlySnapshot | null> => repo.findLatest(),

		create: async (
			input: CreateMonthlySnapshotInput,
		): Promise<MonthlySnapshot> => {
			const existing = await repo.findByMonth(input.month)
			if (existing)
				throw new Error('MonthlySnapshot already exists for this month')
			return repo.create(input)
		},

		update: async (
			id: number,
			input: UpdateMonthlySnapshotInput,
		): Promise<MonthlySnapshot> => {
			const existing = await repo.findById(id)
			if (!existing) throw new Error('MonthlySnapshot not found')
			return repo.update(id, input)
		},
	}
}
