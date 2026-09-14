import { RecurringItemForm } from '@/components/recurring-items/RecurringItemForm'
import { requireUser } from '@/lib/auth-helpers'
import { categoryService, essentialityService } from '@/lib/container'
import { createRecurringItem } from '../actions'

export default async function NewRecurringItemPage() {
	const user = await requireUser()
	const [categories, essentialityLevels] = await Promise.all([
		categoryService.findAll(user.id),
		essentialityService.findAll(user.id),
	])

	return (
		<RecurringItemForm
			mode="create"
			categories={categories}
			essentialityLevels={essentialityLevels}
			onSubmit={createRecurringItem}
		/>
	)
}
