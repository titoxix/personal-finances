import Link from 'next/link'
import { UserTable } from '@/components/admin/UserTable'
import { requireAdmin } from '@/lib/auth-helpers'
import { userService } from '@/lib/container'

const PAGE_SIZE = 20

export default async function AdminUsersPage({
	searchParams,
}: {
	searchParams: Promise<{ page?: string }>
}) {
	await requireAdmin()
	const { page: pageParam } = await searchParams
	const page = Math.max(1, Number(pageParam) || 1)

	const { users, total } = await userService.findAllPaginated(page, PAGE_SIZE)
	const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

	return (
		<div>
			<div className="mb-5">
				<p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
					Administración
				</p>
				<h1 className="text-2xl font-bold text-foreground">Usuarios</h1>
			</div>

			<UserTable users={users} />

			{totalPages > 1 && (
				<div className="mt-4 flex items-center justify-between text-sm">
					<Link
						href={`/admin/users?page=${page - 1}`}
						aria-disabled={page <= 1}
						className={
							page <= 1
								? 'pointer-events-none text-muted-foreground/40'
								: 'font-semibold text-primary hover:underline'
						}
					>
						Anterior
					</Link>
					<span className="text-muted-foreground">
						Página {page} de {totalPages}
					</span>
					<Link
						href={`/admin/users?page=${page + 1}`}
						aria-disabled={page >= totalPages}
						className={
							page >= totalPages
								? 'pointer-events-none text-muted-foreground/40'
								: 'font-semibold text-primary hover:underline'
						}
					>
						Siguiente
					</Link>
				</div>
			)}
		</div>
	)
}
