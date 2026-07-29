import { redirect } from 'next/navigation'
import { OnboardingForm } from '@/components/onboarding/OnboardingForm'
import { requireUser } from '@/lib/auth-helpers'

export default async function OnboardingPage() {
	const user = await requireUser()
	if (user.country) redirect('/')

	return (
		<div className="flex min-h-screen items-center justify-center bg-background px-4">
			<div className="w-full max-w-sm">
				<div className="mb-8 text-center">
					<h1 className="text-2xl font-bold text-foreground">Un último paso</h1>
					<p className="mt-1 text-sm text-muted-foreground">
						Completá tu perfil para empezar
					</p>
				</div>
				<div className="rounded-2xl border border-border bg-card p-6">
					<OnboardingForm />
				</div>
			</div>
		</div>
	)
}
