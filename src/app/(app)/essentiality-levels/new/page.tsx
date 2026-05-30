import { EssentialityLevelForm } from '@/components/essentiality-levels/EssentialityLevelForm'
import { createEssentialityLevel } from '../actions'

export default function NewEssentialityLevelPage() {
	return (
		<EssentialityLevelForm mode="create" onSubmit={createEssentialityLevel} />
	)
}
