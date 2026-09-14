import { InstallmentPlanForm } from '@/components/installment-plans/InstallmentPlanForm'
import { requireUser } from '@/lib/auth-helpers'
import { categoryService, essentialityService } from '@/lib/container'
import { createInstallmentPlan } from '../actions'

export default async function NewInstallmentPlanPage() {
	const user = await requireUser()
	const [categories, essentialityLevels] = await Promise.all([
		categoryService.findAll(user.id),
		essentialityService.findAll(user.id),
	])

	return (
		<div>
			<div className="mb-6">
				<p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
					Planificación
				</p>
				<h1 className="text-2xl font-bold text-foreground">Nuevo plan</h1>
			</div>
			<InstallmentPlanForm
				mode="create"
				categories={categories}
				essentialityLevels={essentialityLevels}
				onSubmit={createInstallmentPlan}
			/>
		</div>
	)
}
