import type { MonthlySnapshot } from '@/domain/entities/monthly-snapshot'
import { MonthlySnapshotCard } from './MonthlySnapshotCard'

type Props = {
	snapshots: MonthlySnapshot[]
}

export function MonthlySnapshotList({ snapshots }: Props) {
	const sorted = [...snapshots].sort(
		(a, b) => b.month.getTime() - a.month.getTime(),
	)

	return (
		<div className="space-y-2">
			{sorted.map((snapshot) => (
				<MonthlySnapshotCard key={snapshot.id} snapshot={snapshot} />
			))}
		</div>
	)
}
