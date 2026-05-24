import { prisma } from '@/lib/prisma'
import { createPrismaCategoryRepository } from '@/repositories/prisma/PrismaCategoryRepository'
import { createCategoryService } from '@/services/CategoryService'
import { createPrismaEssentialityLevelRepository } from '@/repositories/prisma/PrismaEssentialityLevelRepository'
import { createEssentialityLevelService } from '@/services/EssentialityLevelService'
import { createPrismaTransactionRepository } from '@/repositories/prisma/PrismaTransactionRepository'
import { createTransactionService } from '@/services/TransactionService'
import { createPrismaBudgetRepository } from '@/repositories/prisma/PrismaBudgetRepository'
import { createBudgetService } from '@/services/BudgetService'
import { createPrismaMonthlySnapshotRepository } from '@/repositories/prisma/PrismaMonthlySnapshotRepository'
import { createMonthlySnapshotService } from '@/services/MonthlySnapshotService'

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
