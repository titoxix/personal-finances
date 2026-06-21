import { z } from 'zod'
import { BudgetSchema } from './budget'
import { CategorySchema } from './category'
import { EssentialityLevelSchema } from './essentiality-level'
import { InstallmentPlanSchema } from './installment-plan'
import { RecurringItemSchema } from './recurring-item'
import { SnapshotSchema } from './snapshot'
import { TransactionSchema } from './transaction'

const LabelRefSchema = z.object({
	categoryCode: z.string().nullable(),
	categoryLabel: z.string().nullable(),
	essentialityCode: z.string().nullable(),
	essentialityLabel: z.string().nullable(),
})

export const ExportTransactionSchema = TransactionSchema.extend({
	...LabelRefSchema.shape,
	estimated: z.boolean().optional(),
})
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

export const ExportIncomeSchema = z.object({
	grossIncomeUsd: z.number(),
	budgetCapUsd: z.number().nullable(),
	automaticInvestmentUsd: z.number().nullable(),
	automaticDest: z.string().nullable(),
	exchangeRate: z.number().nullable(),
	notes: z.string().nullable(),
})
export type ExportIncome = z.infer<typeof ExportIncomeSchema>

export const ExportExchangeRateSchema = z.object({
	recordedAt: z.date().nullable(),
	source: z.string().nullable(),
	rateBuy: z.number().nullable(),
	rateSell: z.number().nullable(),
	rateMid: z.number().nullable(),
	notes: z.string().nullable(),
})
export type ExportExchangeRate = z.infer<typeof ExportExchangeRateSchema>

export const SnapshotExportGlossarySchema = z.object({
	currency: z.string(),
	paymentMethods: z.record(z.string(), z.string()),
	essentiality: z.string(),
	snapshotFields: z.string(),
	transactions: z.string(),
	budgets: z.string(),
	recurringItems: z.string(),
	installmentPlans: z.string(),
	income: z.string(),
	exchangeRate: z.string(),
})
export type SnapshotExportGlossary = z.infer<
	typeof SnapshotExportGlossarySchema
>

export const SnapshotExportMetaSchema = z.object({
	generatedAt: z.string(),
	date: z.string(),
	monthLabel: z.string(),
	glossary: SnapshotExportGlossarySchema,
})
export type SnapshotExportMeta = z.infer<typeof SnapshotExportMetaSchema>

export const SnapshotExportSchema = z.object({
	meta: SnapshotExportMetaSchema,
	snapshot: SnapshotSchema,
	income: ExportIncomeSchema.nullable(),
	exchangeRate: ExportExchangeRateSchema.nullable(),
	transactions: z.array(ExportTransactionSchema),
	budgets: z.array(ExportBudgetSchema),
	recurringItems: z.array(ExportRecurringItemSchema),
	installmentPlans: z.array(ExportInstallmentPlanSchema),
	categories: z.array(CategorySchema),
	essentialityLevels: z.array(EssentialityLevelSchema),
})
export type SnapshotExport = z.infer<typeof SnapshotExportSchema>
