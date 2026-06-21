import { prisma } from '@/lib/prisma'
import { createPrismaBudgetRepository } from '@/repositories/prisma/PrismaBudgetRepository'
import { createPrismaCategoryRepository } from '@/repositories/prisma/PrismaCategoryRepository'
import { createPrismaEssentialityLevelRepository } from '@/repositories/prisma/PrismaEssentialityLevelRepository'
import { createPrismaExchangeRateRepository } from '@/repositories/prisma/PrismaExchangeRateRepository'
import { createPrismaIncomeRepository } from '@/repositories/prisma/PrismaIncomeRepository'
import { createPrismaInstallmentPlanRepository } from '@/repositories/prisma/PrismaInstallmentPlanRepository'
import { createPrismaRecurringItemRepository } from '@/repositories/prisma/PrismaRecurringItemRepository'
import { createPrismaSnapshotRepository } from '@/repositories/prisma/PrismaSnapshotRepository'
import { createPrismaTransactionRepository } from '@/repositories/prisma/PrismaTransactionRepository'
import { createBudgetService } from '@/services/BudgetService'
import { createCategoryService } from '@/services/CategoryService'
import { createEssentialityLevelService } from '@/services/EssentialityLevelService'
import { createExchangeRateService } from '@/services/ExchangeRateService'
import { createExportService } from '@/services/ExportService'
import { createIncomeService } from '@/services/IncomeService'
import { createInstallmentPlanService } from '@/services/InstallmentPlanService'
import { createRecurringItemService } from '@/services/RecurringItemService'
import { createSnapshotExportService } from '@/services/SnapshotExportService'
import { createSnapshotService } from '@/services/SnapshotService'
import { createTransactionService } from '@/services/TransactionService'

export const exchangeRateService = createExchangeRateService(
	createPrismaExchangeRateRepository(prisma),
)

export const categoryService = createCategoryService(
	createPrismaCategoryRepository(prisma),
)

export const essentialityService = createEssentialityLevelService(
	createPrismaEssentialityLevelRepository(prisma),
)

export const transactionService = createTransactionService(
	createPrismaTransactionRepository(prisma),
	createPrismaInstallmentPlanRepository(prisma),
)

export const budgetService = createBudgetService(
	createPrismaBudgetRepository(prisma),
)

export const snapshotService = createSnapshotService(
	createPrismaSnapshotRepository(prisma),
)

export const incomeService = createIncomeService(
	createPrismaIncomeRepository(prisma),
)

export const recurringItemService = createRecurringItemService(
	createPrismaRecurringItemRepository(prisma),
)

export const installmentPlanService = createInstallmentPlanService(
	createPrismaInstallmentPlanRepository(prisma),
)

export const exportService = createExportService({
	transactionRepo: createPrismaTransactionRepository(prisma),
	incomeRepo: createPrismaIncomeRepository(prisma),
	budgetRepo: createPrismaBudgetRepository(prisma),
	exchangeRateRepo: createPrismaExchangeRateRepository(prisma),
	recurringItemRepo: createPrismaRecurringItemRepository(prisma),
	installmentPlanRepo: createPrismaInstallmentPlanRepository(prisma),
	snapshotRepo: createPrismaSnapshotRepository(prisma),
})

export const snapshotExportService = createSnapshotExportService({
	snapshotRepo: createPrismaSnapshotRepository(prisma),
	transactionRepo: createPrismaTransactionRepository(prisma),
	budgetRepo: createPrismaBudgetRepository(prisma),
	incomeRepo: createPrismaIncomeRepository(prisma),
	exchangeRateRepo: createPrismaExchangeRateRepository(prisma),
	recurringItemRepo: createPrismaRecurringItemRepository(prisma),
	installmentPlanRepo: createPrismaInstallmentPlanRepository(prisma),
	categoryRepo: createPrismaCategoryRepository(prisma),
	essentialityRepo: createPrismaEssentialityLevelRepository(prisma),
})
