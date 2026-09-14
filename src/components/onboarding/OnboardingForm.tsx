'use client'

import { useActionState } from 'react'
import { completeOnboarding } from '@/app/onboarding/actions'
import { Button } from '@/components/ui/button'
import { COUNTRIES } from '@/lib/countries'

export function OnboardingForm() {
	const [state, action, pending] = useActionState(completeOnboarding, null)

	return (
		<form action={action} className="space-y-4">
			<div className="grid grid-cols-2 gap-3">
				<div>
					<label
						htmlFor="firstName"
						className="mb-1.5 block text-sm font-medium text-foreground"
					>
						Nombre
					</label>
					<input
						id="firstName"
						name="firstName"
						autoComplete="given-name"
						className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
					/>
				</div>
				<div>
					<label
						htmlFor="lastName"
						className="mb-1.5 block text-sm font-medium text-foreground"
					>
						Apellido
					</label>
					<input
						id="lastName"
						name="lastName"
						autoComplete="family-name"
						className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
					/>
				</div>
			</div>

			<div>
				<label
					htmlFor="country"
					className="mb-1.5 block text-sm font-medium text-foreground"
				>
					País
				</label>
				<select
					id="country"
					name="country"
					defaultValue=""
					className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
				>
					<option value="" disabled>
						Seleccioná tu país
					</option>
					{COUNTRIES.map((country) => (
						<option key={country} value={country}>
							{country}
						</option>
					))}
				</select>
			</div>

			{state?.error && (
				<p className="text-sm text-destructive">{state.error}</p>
			)}

			<Button type="submit" disabled={pending} className="w-full">
				{pending ? 'Guardando...' : 'Continuar'}
			</Button>
		</form>
	)
}
