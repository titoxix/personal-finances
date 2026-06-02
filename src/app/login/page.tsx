import { LoginForm } from '@/components/login/LoginForm'

type Props = {
	searchParams: Promise<{ next?: string }>
}

export default async function LoginPage({ searchParams }: Props) {
	const { next = '/' } = await searchParams

	return (
		<div className="flex min-h-screen items-center justify-center bg-background px-4">
			<div className="w-full max-w-sm">
				<div className="mb-8 text-center">
					<div className="mb-3 flex justify-center">
						<div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#10b981] to-[#065f46]">
							<span className="text-lg font-bold text-[#003824]">K</span>
						</div>
					</div>
					<h1 className="text-2xl font-bold text-foreground">Kashi</h1>
					<p className="mt-1 text-sm text-muted-foreground">Smart Finance</p>
				</div>

				<div className="rounded-2xl border border-border bg-card p-6">
					<h2 className="mb-4 text-base font-semibold text-foreground">
						Iniciar sesión
					</h2>
					<LoginForm next={next} />
				</div>
			</div>
		</div>
	)
}
