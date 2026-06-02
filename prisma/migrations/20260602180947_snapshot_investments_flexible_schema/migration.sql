/*
  Warnings:

  - You are about to drop the column `etf_portfolio_usd` on the `monthly_snapshot` table. All the data in the column will be lost.
  - You are about to drop the column `etf_return_pct` on the `monthly_snapshot` table. All the data in the column will be lost.
  - You are about to drop the column `investor_fund_gs` on the `monthly_snapshot` table. All the data in the column will be lost.
  - You are about to drop the column `investor_fund_usd` on the `monthly_snapshot` table. All the data in the column will be lost.
  - You are about to drop the column `investor_return_pct` on the `monthly_snapshot` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('USD', 'GS');

-- AlterTable
ALTER TABLE "monthly_snapshot" DROP COLUMN "etf_portfolio_usd",
DROP COLUMN "etf_return_pct",
DROP COLUMN "investor_fund_gs",
DROP COLUMN "investor_fund_usd",
DROP COLUMN "investor_return_pct";

-- CreateTable
CREATE TABLE "snapshot_investments" (
    "id" SERIAL NOT NULL,
    "snapshot_id" INTEGER NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "currency" "Currency" NOT NULL,
    "value" DECIMAL(15,2) NOT NULL,
    "return_pct" DECIMAL(5,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "snapshot_investments_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "snapshot_investments" ADD CONSTRAINT "snapshot_investments_snapshot_id_fkey" FOREIGN KEY ("snapshot_id") REFERENCES "monthly_snapshot"("id") ON DELETE CASCADE ON UPDATE CASCADE;
