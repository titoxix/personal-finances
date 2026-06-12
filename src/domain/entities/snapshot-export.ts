import { z } from 'zod'
import { BudgetSchema } from './budget'
import { CategorySchema } from './category'
import { EssentialityLevelSchema } from './essentiality-level'
import { ExchangeRateSchema } from './exchange-rate'
import { IncomeSchema } from './income'
import { InstallmentPlanSchema } from './installment-plan'
import { MonthlySnapshotSchema } from './monthly-snapshot'
import { RecurringItemSchema } from './recurring-item'
import { TransactionSchema } from './transaction'

const LabelRefSchema = z.object({
	categoryCode: z.string().nullable(),
	categoryLabel: z.string().nullable(),
	essentialityCode: z.string().nullable(),
	essentialityLabel: z.string().nullable(),
})

export const ExportTransactionSchema = TransactionSchema.extend(
	LabelRefSchema.shape,
)
export type ExportTransaction = z.infer<typeof ExportTransactionSchema>

export const ExportBudgetSchema = BudgetSchema.extend(LabelRefSchema.shape)
export type ExportBudget = z.infer<typeof ExportBudgetSchema>

export const ExportRecurringItemSchema = RecurringItemSchema.extend(
	LabelRefSchema.shape,
)
export type ExportRecurringItem = z.infer<typeof ExportRecurringItemSchema>

export const ExportInstallmentPlanSchema = InstallmentPlanSchema.extend(
	LabelRefSchema.shape,
)
export type ExportInstallmentPlan = z.infer<typeof ExportInstallmentPlanSchema>

export const SnapshotExportGlossarySchema = z.object({
	currency: z.string(),
	paymentMethods: z.record(z.string(), z.string()),
	essentiality: z.string(),
	snapshotFields: z.string(),
	transactions: z.string(),
	budgets: z.string(),
	recurringItems: z.string(),
	installmentPlans: z.string(),
	exchangeRate: z.string(),
})
export type SnapshotExportGlossary = z.infer<
	typeof SnapshotExportGlossarySchema
>

export const SnapshotExportMetaSchema = z.object({
	generatedAt: z.string(),
	month: z.string(),
	monthLabel: z.string(),
	glossary: SnapshotExportGlossarySchema,
})
export type SnapshotExportMeta = z.infer<typeof SnapshotExportMetaSchema>

export const SnapshotExportSchema = z.object({
	meta: SnapshotExportMetaSchema,
	snapshot: MonthlySnapshotSchema,
	income: IncomeSchema.nullable(),
	exchangeRate: ExchangeRateSchema.nullable(),
	transactions: z.array(ExportTransactionSchema),
	budgets: z.array(ExportBudgetSchema),
	recurringItems: z.array(ExportRecurringItemSchema),
	installmentPlans: z.array(ExportInstallmentPlanSchema),
	categories: z.array(CategorySchema),
	essentialityLevels: z.array(EssentialityLevelSchema),
})
export type SnapshotExport = z.infer<typeof SnapshotExportSchema>
