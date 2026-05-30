'use client'

import { Check, Layers, Lock } from 'lucide-react'
import { useState, useTransition } from 'react'
import type {
	CreateEssentialityLevelPayload,
	UpdateEssentialityLevelPayload,
} from '@/app/(app)/essentiality-levels/actions'
import type { EssentialityLevel } from '@/domain/entities/essentiality-level'

type NewProps = {
	mode: 'create'
	onSubmit: (
		payload: CreateEssentialityLevelPayload,
	) => Promise<{ error: string } | undefined>
	initialValues?: undefined
	onDeactivate?: undefined
}

type EditProps = {
	mode: 'edit'
	onSubmit: (
		payload: UpdateEssentialityLevelPayload,
	) => Promise<{ error: string } | undefined>
	onDeactivate: () => Promise<{ error: string } | undefined>
	initialValues: EssentialityLevel
}

type Props = NewProps | EditProps

export function EssentialityLevelForm(props: Props) {
	const { initialValues } = props
	const [code, setCode] = useState(initialValues?.code ?? '')
	const [label, setLabel] = useState(initialValues?.label ?? '')
	const [sortOrder, setSortOrder] = useState(
		initialValues?.sortOrder?.toString() ?? '',
	)
	const [description, setDescription] = useState(
		initialValues?.description ?? '',
	)
	const [error, setError] = useState<string | null>(null)
	const [isPending, startTransition] = useTransition()
	const [isDeactivating, startDeactivateTransition] = useTransition()

	const sortOrderNum = Number(sortOrder)
	const isValid =
		props.mode === 'create'
			? code.trim().length > 0 &&
				label.trim().length > 0 &&
				sortOrder.trim().length > 0 &&
				!Number.isNaN(sortOrderNum)
			: label.trim().length > 0 &&
				sortOrder.trim().length > 0 &&
				!Number.isNaN(sortOrderNum)

	function handleSubmit() {
		if (!isValid) {
			setError('Completá los campos requeridos.')
			return
		}
		setError(null)
		startTransition(async () => {
			let result: { error: string } | undefined
			if (props.mode === 'create') {
				result = await props.onSubmit({
					code: code.trim(),
					label: label.trim(),
					sortOrder: sortOrderNum,
					description: description.trim() || undefined,
				})
			} else {
				result = await props.onSubmit({
					label: label.trim(),
					sortOrder: sortOrderNum,
					description: description.trim() || undefined,
				})
			}
			if (result?.error) setError(result.error)
		})
	}

	function handleDeactivate() {
		if (props.mode !== 'edit') return
		setError(null)
		startDeactivateTransition(async () => {
			const result = await props.onDeactivate()
			if (result?.error) setError(result.error)
		})
	}

	const isInactive = props.mode === 'edit' && !initialValues?.active

	return (
		<div className="space-y-5 pb-6">
			{/* Inactive banner */}
			{isInactive && (
				<div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
					<p className="text-sm font-semibold text-amber-400">
						Este nivel está inactivo
					</p>
					<p className="text-xs text-amber-400/70">
						No aparecerá disponible para nuevos registros.
					</p>
				</div>
			)}

			{/* Code */}
			<div className="space-y-2">
				<label
					htmlFor="el-code"
					className="text-sm font-semibold text-foreground"
				>
					Code
					{props.mode === 'create' && (
						<span className="ml-1 text-primary">*</span>
					)}
				</label>
				{props.mode === 'create' ? (
					<input
						id="el-code"
						type="text"
						value={code}
						onChange={(e) =>
							setCode(e.target.value.toLowerCase().replace(/\s+/g, '_'))
						}
						placeholder="e.g. essential"
						className="w-full rounded-2xl border border-border bg-card px-4 py-3.5 font-mono text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/60 transition-colors"
					/>
				) : (
					<div className="relative">
						<input
							id="el-code"
							type="text"
							value={code}
							disabled
							className="w-full rounded-2xl border border-border bg-card/40 px-4 py-3.5 pr-12 font-mono text-sm text-muted-foreground outline-none"
						/>
						<Lock className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
					</div>
				)}
				<p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 italic">
					{props.mode === 'create'
						? 'Identificador único del sistema'
						: 'El código identificador no puede ser modificado.'}
				</p>
			</div>

			{/* Label */}
			<div className="space-y-2">
				<label
					htmlFor="el-label"
					className="text-sm font-semibold text-foreground"
				>
					Label
					<span className="ml-1 text-primary">*</span>
				</label>
				<input
					id="el-label"
					type="text"
					value={label}
					onChange={(e) => setLabel(e.target.value)}
					placeholder="e.g. Esencial"
					className="w-full rounded-2xl border border-border bg-card px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/60 transition-colors"
				/>
			</div>

			{/* Sort Order */}
			<div className="space-y-2">
				<label
					htmlFor="el-sort"
					className="text-sm font-semibold text-foreground"
				>
					Orden de visualización
					<span className="ml-1 text-primary">*</span>
				</label>
				<input
					id="el-sort"
					type="number"
					min={0}
					value={sortOrder}
					onChange={(e) => setSortOrder(e.target.value)}
					placeholder="e.g. 1"
					className="w-full rounded-2xl border border-border bg-card px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/60 transition-colors"
				/>
				<p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 italic">
					Número entero ≥ 0. Los niveles se listan de menor a mayor.
				</p>
			</div>

			{/* Description */}
			<div className="space-y-2">
				<label
					htmlFor="el-description"
					className="text-sm font-semibold text-foreground"
				>
					Description{' '}
					<span className="font-normal text-muted-foreground">(Opcional)</span>
				</label>
				<textarea
					id="el-description"
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					placeholder="Añade una nota sobre este nivel..."
					rows={3}
					className="w-full resize-none rounded-2xl border border-border bg-card px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/60 transition-colors"
				/>
			</div>

			{/* Preview — create mode only */}
			{props.mode === 'create' && (
				<div className="rounded-2xl border border-border bg-card/50 p-4">
					<p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-primary">
						Vista previa
					</p>
					<div className="flex items-center gap-3">
						<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/20">
							<Layers className="h-5 w-5 text-primary" />
						</div>
						<div className="min-w-0">
							<p className="truncate text-base font-semibold text-foreground">
								{label || 'Nombre'}
							</p>
							<p className="font-mono text-xs text-muted-foreground">
								#{code || 'codigo'} · orden {sortOrder || '0'}
							</p>
						</div>
					</div>
				</div>
			)}

			{/* Error */}
			{error && (
				<p className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
					{error}
				</p>
			)}

			{/* Submit */}
			<button
				type="button"
				onClick={handleSubmit}
				disabled={isPending || isDeactivating}
				className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-base font-bold text-primary-foreground transition-opacity disabled:opacity-60"
			>
				<Check className="h-5 w-5" />
				{isPending ? 'Guardando...' : 'Guardar'}
			</button>

			{/* Deactivate — edit mode, only when active */}
			{props.mode === 'edit' && initialValues?.active && (
				<button
					type="button"
					onClick={handleDeactivate}
					disabled={isPending || isDeactivating}
					className="flex w-full items-center justify-center gap-2 rounded-2xl border border-destructive/40 bg-destructive/10 py-3.5 text-sm font-semibold text-destructive transition-opacity hover:bg-destructive/20 disabled:opacity-60"
				>
					{isDeactivating ? 'Desactivando...' : 'Desactivar nivel'}
				</button>
			)}
		</div>
	)
}
