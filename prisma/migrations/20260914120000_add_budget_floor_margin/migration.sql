-- AlterTable
ALTER TABLE "budgets" ALTER COLUMN "essentiality_id" DROP NOT NULL,
ADD COLUMN     "margin_usd" DECIMAL(10,2),
ADD COLUMN     "margin_gs" DECIMAL(15,2);
