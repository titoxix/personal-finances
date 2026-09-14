import type { User } from '@/domain/entities/user'

function formatDate(date: Date): string {
	return new Intl.DateTimeFormat('es-PY', {
		year: 'numeric',
		month: 'short',
		day: '2-digit',
	}).format(date)
}

export function UserTable({ users }: { users: User[] }) {
	if (users.length === 0) {
		return (
			<p className="py-10 text-center text-sm text-muted-foreground">
				No hay usuarios registrados.
			</p>
		)
	}

	return (
		<div className="overflow-x-auto rounded-2xl border border-border bg-card">
			<table className="w-full text-sm">
				<thead>
					<tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
						<th className="px-4 py-3 font-semibold">Correo</th>
						<th className="px-4 py-3 font-semibold">Nombre</th>
						<th className="px-4 py-3 font-semibold">Apellido</th>
						<th className="px-4 py-3 font-semibold">País</th>
						<th className="px-4 py-3 font-semibold">Rol</th>
						<th className="px-4 py-3 font-semibold">Alta</th>
					</tr>
				</thead>
				<tbody>
					{users.map((user) => (
						<tr key={user.id} className="border-b border-border last:border-0">
							<td className="px-4 py-3 text-foreground">{user.email}</td>
							<td className="px-4 py-3 text-foreground">
								{user.firstName ?? '—'}
							</td>
							<td className="px-4 py-3 text-foreground">
								{user.lastName ?? '—'}
							</td>
							<td className="px-4 py-3 text-foreground">
								{user.country ?? '—'}
							</td>
							<td className="px-4 py-3">
								<span
									className={
										user.role === 'ADMIN'
											? 'rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary'
											: 'rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground'
									}
								>
									{user.role}
								</span>
							</td>
							<td className="px-4 py-3 text-muted-foreground">
								{formatDate(user.createdAt)}
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	)
}
