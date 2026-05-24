'use client'

import { Check, Lock, Shapes } from 'lucide-react'
import { useState, useTransition } from 'react'
import type {
	CreateCategoryPayload,
	UpdateCategoryPayload,
} from '@/app/(app)/categories/actions'
import type { Category } from '@/domain/entities/category'

type NewProps = {
	mode: 'create'
	onSubmit: (
		payload: CreateCategoryPayload,
	) => Promise<{ error: string } | undefined>
	initialValues?: undefined
}

type EditProps = {
	mode: 'edit'
	onSubmit: (
		payload: UpdateCategoryPayload,
	) => Promise<{ error: string } | undefined>
	initialValues: Category
}

type Props = NewProps | EditProps

export function CategoryForm(props: Props) {
	const { initialValues } = props
	const [code, setCode] = useState(initialValues?.code ?? '')
	const [label, setLabel] = useState(initialValues?.label ?? '')
	const [description, setDescription] = useState(
		initialValues?.description ?? '',
	)
	const [active, setActive] = useState(initialValues?.active ?? true)
	const [error, setError] = useState<string | null>(null)
	const [isPending, startTransition] = useTransition()

	const isValid =
		props.mode === 'create'
			? code.trim().length > 0 && label.trim().length > 0
			: label.trim().length > 0

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
					description: description.trim() || undefined,
				})
			} else {
				result = await props.onSubmit({
					label: label.trim(),
					description: description.trim() || undefined,
					active,
				})
			}
			if (result?.error) setError(result.error)
		})
	}

	return (
		<div className="space-y-5 pb-6">
			{/* Code */}
			<div className="space-y-2">
				<label
					htmlFor="cat-code"
					className="text-sm font-semibold text-foreground"
				>
					Code
					{props.mode === 'create' && (
						<span className="ml-1 text-primary">*</span>
					)}
				</label>
				{props.mode === 'create' ? (
					<input
						id="cat-code"
						type="text"
						value={code}
						onChange={(e) =>
							setCode(e.target.value.toLowerCase().replace(/\s+/g, '_'))
						}
						placeholder="e.g. supermercado"
						className="w-full rounded-2xl border border-border bg-card px-4 py-3.5 font-mono text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/60 transition-colors"
					/>
				) : (
					<div className="relative">
						<input
							id="cat-code"
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
					htmlFor="cat-label"
					className="text-sm font-semibold text-foreground"
				>
					Label
					{props.mode === 'create' && (
						<span className="ml-1 text-primary">*</span>
					)}
				</label>
				<input
					id="cat-label"
					type="text"
					value={label}
					onChange={(e) => setLabel(e.target.value)}
					placeholder="e.g. Supermercado"
					className="w-full rounded-2xl border border-border bg-card px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/60 transition-colors"
				/>
			</div>

			{/* Description */}
			<div className="space-y-2">
				<label
					htmlFor="cat-description"
					className="text-sm font-semibold text-foreground"
				>
					Description{' '}
					<span className="font-normal text-muted-foreground">(Opcional)</span>
				</label>
				<textarea
					id="cat-description"
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					placeholder="Añade una nota sobre esta categoría..."
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
							<Shapes className="h-5 w-5 text-primary" />
						</div>
						<div className="min-w-0">
							<p className="truncate text-base font-semibold text-foreground">
								{label || 'Nombre'}
							</p>
							<p className="font-mono text-xs text-muted-foreground">
								#{code || 'codigo'}
							</p>
						</div>
					</div>
				</div>
			)}

			{/* Active toggle — edit mode only */}
			{props.mode === 'edit' && (
				<div className="flex items-center justify-between rounded-2xl border border-border bg-card p-4">
					<div>
						<p className="text-sm font-semibold text-foreground">Activa</p>
						<p className="text-xs text-muted-foreground">
							Habilitar esta categoría para nuevos registros
						</p>
					</div>
					<button
						type="button"
						role="switch"
						aria-checked={active}
						onClick={() => setActive((v) => !v)}
						className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
							active ? 'bg-primary' : 'bg-muted'
						}`}
					>
						<span
							className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${
								active ? 'left-6' : 'left-1'
							}`}
						/>
					</button>
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
				disabled={isPending}
				className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-base font-bold text-primary-foreground transition-opacity disabled:opacity-60"
			>
				<Check className="h-5 w-5" />
				{isPending ? 'Guardando...' : 'Guardar'}
			</button>
		</div>
	)
}
