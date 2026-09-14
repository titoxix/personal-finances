export const DEFAULT_ESSENTIALITY_LEVELS = [
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
] as const

export const DEFAULT_CATEGORIES = [
	{
		code: 'vivienda',
		label: 'Vivienda',
		description: 'Alquiler, electricidad, internet',
	},
	{
		code: 'salud',
		label: 'Salud',
		description: 'Seguros médicos, consultas, gym',
	},
	{
		code: 'alimentacion',
		label: 'Alimentación',
		description: 'Supermercado, almuerzo, delivery',
	},
	{
		code: 'transporte',
		label: 'Transporte',
		description: 'Seguro auto, nafta, car wash, parking',
	},
	{
		code: 'educacion',
		label: 'Educación',
		description: 'Cursos, plataformas, idiomas',
	},
	{
		code: 'familia',
		label: 'Familia',
		description: 'Babysitter, gastos del bebé',
	},
	{
		code: 'digital',
		label: 'Digital',
		description: 'Suscripciones y servicios digitales',
	},
	{
		code: 'ocio',
		label: 'Ocio',
		description: 'Restaurantes, cine, bares, entretenimiento',
	},
	{
		code: 'impuestos',
		label: 'Impuestos',
		description: 'IRP y obligaciones fiscales',
	},
	{
		code: 'compras_grandes',
		label: 'Compras grandes',
		description: 'Compras no recurrentes mayores a $200',
	},
	{
		code: 'inversion',
		label: 'Inversión',
		description: 'ETFs, fondos mutuos, activos financieros',
	},
	{
		code: 'otros',
		label: 'Otros',
		description: 'Lo que no entra en ninguna categoría',
	},
] as const
