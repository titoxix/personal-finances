import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../src/generated/prisma/client'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
	await seedEssentialityLevels()
	await seedCategories()
	await seedExchangeRates()
}

async function seedEssentialityLevels() {
	const levels = [
		{
			code: 'esencial',
			label: 'Esencial',
			description: 'No cortable. Sin esto no funciona la vida básica del hogar.',
			sortOrder: 1,
		},
		{
			code: 'importante',
			label: 'Importante',
			description: 'Cortable con dolor. Se reconsideraría solo en crisis seria.',
			sortOrder: 2,
		},
		{
			code: 'opcional',
			label: 'Opcional',
			description: 'Cortable sin drama si hace falta ajustar.',
			sortOrder: 3,
		},
		{
			code: 'inversion',
			label: 'Inversión',
			description: 'No es gasto, es construcción de activo.',
			sortOrder: 4,
		},
	]

	for (const level of levels) {
		await prisma.essentialityLevel.upsert({
			where: { code: level.code },
			update: { label: level.label, description: level.description, sortOrder: level.sortOrder },
			create: level,
		})
	}

	console.log(`✓ essentiality_levels: ${levels.length} registros`)
}

async function seedCategories() {
	const categories = [
		{ code: 'vivienda',        label: 'Vivienda',        description: 'Alquiler, electricidad, internet' },
		{ code: 'salud',           label: 'Salud',           description: 'Seguros médicos, consultas, gym' },
		{ code: 'alimentacion',    label: 'Alimentación',    description: 'Supermercado, almuerzo, delivery' },
		{ code: 'transporte',      label: 'Transporte',      description: 'Seguro auto, nafta, car wash, parking' },
		{ code: 'educacion',       label: 'Educación',       description: 'Cursos, plataformas, idiomas' },
		{ code: 'familia',         label: 'Familia',         description: 'Babysitter, gastos del bebé' },
		{ code: 'digital',         label: 'Digital',         description: 'Suscripciones y servicios digitales' },
		{ code: 'ocio',            label: 'Ocio',            description: 'Restaurantes, cine, bares, entretenimiento' },
		{ code: 'impuestos',       label: 'Impuestos',       description: 'IRP y obligaciones fiscales' },
		{ code: 'compras_grandes', label: 'Compras grandes', description: 'Compras no recurrentes mayores a $200' },
		{ code: 'inversion',       label: 'Inversión',       description: 'ETFs, fondos mutuos, activos financieros' },
		{ code: 'otros',           label: 'Otros',           description: 'Lo que no entra en ninguna categoría' },
	]

	for (const category of categories) {
		await prisma.category.upsert({
			where: { code: category.code },
			update: { label: category.label, description: category.description },
			create: category,
		})
	}

	console.log(`✓ categories: ${categories.length} registros`)
}

async function seedExchangeRates() {
	// Exchange rates are append-only — each run adds a new snapshot.
	// Skip if rates for today already exist to avoid duplicates on re-runs.
	const today = new Date()
	today.setHours(0, 0, 0, 0)
	const tomorrow = new Date(today)
	tomorrow.setDate(tomorrow.getDate() + 1)

	const existing = await prisma.exchangeRate.count({
		where: { recordedAt: { gte: today, lt: tomorrow } },
	})

	if (existing > 0) {
		console.log('✓ exchange_rates: ya existen registros para hoy, se omite')
		return
	}

	await prisma.exchangeRate.createMany({
		data: [
			{ source: 'itau', rateBuy: 6025.00, rateSell: 6290.00 },
			{ source: 'ueno', rateBuy: 6080.00, rateSell: 6280.00 },
			{ source: 'bcp',  rateMid: 6187.88 },
		],
	})

	console.log('✓ exchange_rates: 3 registros')
}

main()
	.catch((e) => {
		console.error(e)
		process.exit(1)
	})
	.finally(() => prisma.$disconnect())
