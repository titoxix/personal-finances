import { notFound } from 'next/navigation'
import { InstallmentPlanForm } from '@/components/installment-plans/InstallmentPlanForm'
import {
	categoryService,
	essentialityService,
	installmentPlanService,
} from '@/lib/container'
import type { UpdateInstallmentPlanPayload } from '../../actions'
import { deactivateInstallmentPlan, updateInstallmentPlan } from '../../actions'

export default async function EditInstallmentPlanPage({
	params,
}: {
	params: Promise<{ id: string }>
}) {
	const { id: idStr } = await params
	const id = Number(idStr)
	if (Number.isNaN(id)) notFound()

	const [plan, categories, essentialityLevels] = await Promise.all([
		installmentPlanService.findById(id).catch(() => null),
		categoryService.findAll(),
		essentialityService.findAll(),
	])

	if (!plan) notFound()

	async function handleUpdate(payload: UpdateInstallmentPlanPayload) {
		'use server'
		return updateInstallmentPlan(id, payload)
	}

	async function handleDeactivate() {
		'use server'
		return deactivateInstallmentPlan(id)
	}

	return (
		<div>
			<div className="mb-6">
				<p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
					Planificación
				</p>
				<h1 className="text-2xl font-bold text-foreground">Editar plan</h1>
			</div>
			<InstallmentPlanForm
				mode="edit"
				categories={categories}
				essentialityLevels={essentialityLevels}
				onSubmit={handleUpdate}
				onDeactivate={handleDeactivate}
				initialValues={plan}
			/>
		</div>
	)
}
