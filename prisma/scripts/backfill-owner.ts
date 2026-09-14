import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../../src/generated/prisma/client'

const connectionString = process.env.DATABASE_URL
if (!connectionString) throw new Error('DATABASE_URL is not set')
const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

const OWNER_EMAIL = 'mat.360z@gmail.com'
const OWNER_NAME = 'Matias Martinez'
const OWNER_COUNTRY = 'Paraguay'

const TABLES_WITH_USER_ID = [
	'categories',
	'essentiality_levels',
	'exchange_rates',
	'income',
	'installment_plans',
	'transactions',
	'budgets',
	'monthly_snapshot',
	'recurring_items',
] as const

async function countRows(tx: PrismaClient, table: string): Promise<number> {
	const rows = await tx.$queryRawUnsafe<{ count: bigint }[]>(
		`SELECT count(*)::bigint AS count FROM "${table}"`,
	)
	return Number(rows[0]?.count ?? 0)
}

async function countNullOwner(
	tx: PrismaClient,
	table: string,
): Promise<number> {
	const rows = await tx.$queryRawUnsafe<{ count: bigint }[]>(
		`SELECT count(*)::bigint AS count FROM "${table}" WHERE user_id IS NULL`,
	)
	return Number(rows[0]?.count ?? 0)
}

async function main() {
	const before: Record<string, number> = {}
	for (const table of TABLES_WITH_USER_ID) {
		before[table] = await countRows(prisma, table)
	}

	const existingOwners = await prisma.user.count({
		where: { email: OWNER_EMAIL },
	})
	if (existingOwners > 1) {
		throw new Error(
			`Duplicados de email ${OWNER_EMAIL} detectados (${existingOwners}) — abortando`,
		)
	}

	const owner = await prisma.user.upsert({
		where: { email: OWNER_EMAIL },
		update: {
			name: OWNER_NAME,
			country: OWNER_COUNTRY,
			role: 'ADMIN',
		},
		create: {
			email: OWNER_EMAIL,
			name: OWNER_NAME,
			country: OWNER_COUNTRY,
			role: 'ADMIN',
		},
	})

	console.log(`Owner: ${owner.email} (${owner.id}), role=${owner.role}`)

	await prisma.$transaction(async (tx) => {
		for (const table of TABLES_WITH_USER_ID) {
			await tx.$executeRawUnsafe(
				`UPDATE "${table}" SET user_id = $1 WHERE user_id IS NULL`,
				owner.id,
			)
		}

		for (const table of TABLES_WITH_USER_ID) {
			const beforeCount = before[table] ?? 0
			const afterCount = await countRows(tx as PrismaClient, table)
			const nullCount = await countNullOwner(tx as PrismaClient, table)
			const assignedToOwner = await tx.$queryRawUnsafe<{ count: bigint }[]>(
				`SELECT count(*)::bigint AS count FROM "${table}" WHERE user_id = $1`,
				owner.id,
			)
			const assignedCount = Number(assignedToOwner[0]?.count ?? 0)

			console.log(
				`${table}: before=${beforeCount} after=${afterCount} nulls=${nullCount} assignedToOwner=${assignedCount}`,
			)

			if (afterCount !== beforeCount) {
				throw new Error(
					`${table}: el conteo cambió (${beforeCount} -> ${afterCount}). Abortando transacción.`,
				)
			}
			if (nullCount !== 0) {
				throw new Error(
					`${table}: quedan ${nullCount} filas con user_id NULL. Abortando transacción.`,
				)
			}
			if (assignedCount !== afterCount) {
				throw new Error(
					`${table}: ${afterCount - assignedCount} filas no quedaron asignadas al owner. Abortando transacción.`,
				)
			}
		}
	})

	const duplicateOwners = await prisma.user.count({
		where: { email: OWNER_EMAIL },
	})
	if (duplicateOwners !== 1) {
		throw new Error(
			`Se esperaba exactamente 1 usuario con ${OWNER_EMAIL}, hay ${duplicateOwners}`,
		)
	}

	console.log('Backfill completado sin pérdida de datos.')
}

main()
	.catch((e) => {
		console.error(e)
		process.exit(1)
	})
	.finally(() => prisma.$disconnect())
