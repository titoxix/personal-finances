-- DropForeignKey
ALTER TABLE "budgets" DROP CONSTRAINT "budgets_user_id_fkey";

-- DropForeignKey
ALTER TABLE "categories" DROP CONSTRAINT "categories_user_id_fkey";

-- DropForeignKey
ALTER TABLE "essentiality_levels" DROP CONSTRAINT "essentiality_levels_user_id_fkey";

-- DropForeignKey
ALTER TABLE "exchange_rates" DROP CONSTRAINT "exchange_rates_user_id_fkey";

-- DropForeignKey
ALTER TABLE "income" DROP CONSTRAINT "income_user_id_fkey";

-- DropForeignKey
ALTER TABLE "installment_plans" DROP CONSTRAINT "installment_plans_user_id_fkey";

-- DropForeignKey
ALTER TABLE "monthly_snapshot" DROP CONSTRAINT "monthly_snapshot_user_id_fkey";

-- DropForeignKey
ALTER TABLE "recurring_items" DROP CONSTRAINT "recurring_items_user_id_fkey";

-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_user_id_fkey";

-- DropIndex
DROP INDEX "budgets_month_category_id_key";

-- DropIndex
DROP INDEX "budgets_user_id_idx";

-- DropIndex
DROP INDEX "categories_user_id_idx";

-- DropIndex
DROP INDEX "essentiality_levels_user_id_idx";

-- AlterTable
ALTER TABLE "budgets" ALTER COLUMN "user_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "categories" ALTER COLUMN "user_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "essentiality_levels" ALTER COLUMN "user_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "exchange_rates" ALTER COLUMN "user_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "income" ALTER COLUMN "user_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "installment_plans" ALTER COLUMN "user_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "monthly_snapshot" ALTER COLUMN "user_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "recurring_items" ALTER COLUMN "user_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "transactions" ALTER COLUMN "user_id" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "budgets_user_id_month_category_id_key" ON "budgets"("user_id", "month", "category_id");

-- CreateIndex
CREATE UNIQUE INDEX "categories_user_id_code_key" ON "categories"("user_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "essentiality_levels_user_id_code_key" ON "essentiality_levels"("user_id", "code");

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "essentiality_levels" ADD CONSTRAINT "essentiality_levels_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exchange_rates" ADD CONSTRAINT "exchange_rates_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "income" ADD CONSTRAINT "income_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "installment_plans" ADD CONSTRAINT "installment_plans_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monthly_snapshot" ADD CONSTRAINT "monthly_snapshot_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurring_items" ADD CONSTRAINT "recurring_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

