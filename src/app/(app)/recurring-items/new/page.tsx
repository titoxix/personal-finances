import { RecurringItemForm } from '@/components/recurring-items/RecurringItemForm'
import { categoryService, essentialityService } from '@/lib/container'
import { createRecurringItem } from '../actions'

export default async function NewRecurringItemPage() {
	const [categories, essentialityLevels] = await Promise.all([
		categoryService.findAll(),
		essentialityService.findAll(),
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
