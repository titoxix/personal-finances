import type { Snapshot } from '@/domain/entities/snapshot'
import { SnapshotCard } from './SnapshotCard'

type Props = {
	snapshots: Snapshot[]
}

export function SnapshotList({ snapshots }: Props) {
	const sorted = [...snapshots].sort(
		(a, b) => b.date.getTime() - a.date.getTime(),
	)

	return (
		<div className="space-y-2">
			{sorted.map((snapshot) => (
				<SnapshotCard key={snapshot.id} snapshot={snapshot} />
			))}
		</div>
	)
}
