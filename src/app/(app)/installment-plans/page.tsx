import { Plus } from 'lucide-react'
import Link from 'next/link'
import { InstallmentPlanList } from '@/components/installment-plans/InstallmentPlanList'
import {
	categoryService,
	essentialityService,
	installmentPlanService,
} from '@/lib/container'

export default async function InstallmentPlansPage() {
	const [plans, categories, essentialityLevels] = await Promise.all([
		installmentPlanService.findAll(),
		categoryService.findAll(),
		essentialityService.findAll(),
	])

	return (
		<div>
			<div className="mb-5 flex items-end justify-between">
				<div>
					<p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
						Planificación
					</p>
					<h1 className="text-2xl font-bold text-foreground">Cuotas</h1>
				</div>
				<Link
					href="/installment-plans/new"
					className="flex shrink-0 items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
				>
					<Plus className="h-4 w-4" strokeWidth={2.5} />
					Nuevo
				</Link>
			</div>

			{plans.length === 0 ? (
				<div className="flex flex-col items-center gap-3 py-16 text-center">
					<p className="text-base font-semibold text-foreground">
						Sin planes en cuotas
					</p>
					<p className="max-w-[240px] text-sm text-muted-foreground">
						Registrá tus compras en cuotas para seguir el progreso de cada pago.
					</p>
					<Link
						href="/installment-plans/new"
						className="mt-2 rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground"
					>
						Agregar plan
					</Link>
				</div>
			) : (
				<InstallmentPlanList
					plans={plans}
					categories={categories}
					essentialityLevels={essentialityLevels}
				/>
			)}
		</div>
	)
}
