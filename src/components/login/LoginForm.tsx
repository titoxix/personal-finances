'use client'

import { useActionState } from 'react'
import { loginAction } from '@/app/login/actions'
import { Button } from '@/components/ui/button'

type Props = {
	next: string
}

export function LoginForm({ next }: Props) {
	const [state, action, pending] = useActionState(loginAction, null)

	return (
		<form action={action} className="space-y-4">
			<input type="hidden" name="next" value={next} />
			<div>
				<label
					htmlFor="email"
					className="mb-1.5 block text-sm font-medium text-foreground"
				>
					Correo
				</label>
				<input
					id="email"
					type="email"
					name="email"
					autoComplete="email"
					className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
					placeholder="tu@correo.com"
				/>
			</div>
			<div>
				<label
					htmlFor="password"
					className="mb-1.5 block text-sm font-medium text-foreground"
				>
					Contraseña
				</label>
				<input
					id="password"
					type="password"
					name="password"
					autoComplete="current-password"
					className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
					placeholder="••••••••"
				/>
			</div>

			{state?.error && (
				<p className="text-sm text-destructive">{state.error}</p>
			)}

			<Button type="submit" disabled={pending} className="w-full">
				{pending ? 'Entrando...' : 'Entrar'}
			</Button>
		</form>
	)
}
