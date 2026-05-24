import { prisma } from '@/lib/prisma'
import { createPrismaBudgetRepository } from '@/repositories/prisma/PrismaBudgetRepository'
import { createPrismaCategoryRepository } from '@/repositories/prisma/PrismaCategoryRepository'
import { createPrismaEssentialityLevelRepository } from '@/repositories/prisma/PrismaEssentialityLevelRepository'
import { createPrismaExchangeRateRepository } from '@/repositories/prisma/PrismaExchangeRateRepository'
import { createPrismaMonthlySnapshotRepository } from '@/repositories/prisma/PrismaMonthlySnapshotRepository'
import { createPrismaTransactionRepository } from '@/repositories/prisma/PrismaTransactionRepository'
import { createBudgetService } from '@/services/BudgetService'
import { createCategoryService } from '@/services/CategoryService'
import { createEssentialityLevelService } from '@/services/EssentialityLevelService'
import { createExchangeRateService } from '@/services/ExchangeRateService'
import { createMonthlySnapshotService } from '@/services/MonthlySnapshotService'
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
)

export const budgetService = createBudgetService(
	createPrismaBudgetRepository(prisma),
)

export const monthlySnapshotService = createMonthlySnapshotService(
	createPrismaMonthlySnapshotRepository(prisma),
)
