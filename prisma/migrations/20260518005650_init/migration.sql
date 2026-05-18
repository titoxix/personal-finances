-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('itau_visa', 'ueno_mastercard', 'itau_debito', 'ueno_debito', 'transferencia', 'mango', 'gnb_mastercard');

-- CreateEnum
CREATE TYPE "ExchangeRateSource" AS ENUM ('itau', 'ueno', 'bcp');

-- CreateEnum
CREATE TYPE "RecurringFrequency" AS ENUM ('monthly', 'annual');

-- CreateTable
CREATE TABLE "categories" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "label" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "essentiality_levels" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "label" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "sort_order" SMALLINT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "essentiality_levels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exchange_rates" (
    "id" SERIAL NOT NULL,
    "recorded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source" "ExchangeRateSource" NOT NULL,
    "rate_buy" DECIMAL(10,2),
    "rate_sell" DECIMAL(10,2),
    "rate_mid" DECIMAL(10,2),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exchange_rates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "income" (
    "id" SERIAL NOT NULL,
    "month" DATE NOT NULL,
    "gross_income_usd" DECIMAL(10,2) NOT NULL,
    "budget_cap_usd" DECIMAL(10,2) NOT NULL,
    "automatic_investment_usd" DECIMAL(10,2) NOT NULL,
    "automatic_dest" VARCHAR(50) NOT NULL,
    "exchange_rate" DECIMAL(10,2) NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "income_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "installment_plans" (
    "id" SERIAL NOT NULL,
    "description" VARCHAR(255) NOT NULL,
    "total_amount_gs" DECIMAL(15,2),
    "total_amount_usd" DECIMAL(10,2),
    "installments_total" SMALLINT NOT NULL,
    "installments_paid" SMALLINT NOT NULL DEFAULT 0,
    "installment_amount_gs" DECIMAL(15,2),
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "payment_method" "PaymentMethod" NOT NULL,
    "category_id" INTEGER NOT NULL,
    "essentiality_id" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "installment_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" SERIAL NOT NULL,
    "date" DATE NOT NULL,
    "description" VARCHAR(255) NOT NULL,
    "amount_gs" DECIMAL(15,2),
    "amount_usd" DECIMAL(10,2),
    "exchange_rate" DECIMAL(10,2),
    "exchange_rate_id" INTEGER,
    "category_id" INTEGER NOT NULL,
    "essentiality_id" INTEGER NOT NULL,
    "payment_method" "PaymentMethod" NOT NULL,
    "week_of_month" SMALLINT,
    "is_installment" BOOLEAN NOT NULL DEFAULT false,
    "installment_current" SMALLINT,
    "installment_total" SMALLINT,
    "installment_plan_id" INTEGER,
    "is_recurring" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "budgets" (
    "id" SERIAL NOT NULL,
    "month" DATE NOT NULL,
    "category_id" INTEGER NOT NULL,
    "essentiality_id" INTEGER NOT NULL,
    "budgeted_usd" DECIMAL(10,2),
    "budgeted_gs" DECIMAL(15,2),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "budgets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "monthly_snapshot" (
    "id" SERIAL NOT NULL,
    "month" DATE NOT NULL,
    "income_usd" DECIMAL(10,2),
    "exchange_rate" DECIMAL(10,2),
    "exchange_rate_id" INTEGER,
    "balance_itau_usd" DECIMAL(10,2),
    "balance_itau_gs" DECIMAL(15,2),
    "balance_ueno_usd" DECIMAL(10,2),
    "balance_ueno_gs" DECIMAL(15,2),
    "balance_mango_gs" DECIMAL(15,2),
    "balance_gnb_gs" DECIMAL(15,2),
    "gnb_card_gs" DECIMAL(15,2),
    "investor_fund_usd" DECIMAL(10,2),
    "investor_fund_gs" DECIMAL(15,2),
    "investor_return_pct" DECIMAL(5,2),
    "etf_portfolio_usd" DECIMAL(10,2),
    "etf_return_pct" DECIMAL(5,2),
    "itau_card_gs" DECIMAL(15,2),
    "ueno_card_gs" DECIMAL(15,2),
    "pending_installments_gs" DECIMAL(15,2),
    "net_worth_usd" DECIMAL(10,2),
    "total_invested_usd" DECIMAL(10,2),
    "total_debt_usd" DECIMAL(10,2),
    "savings_rate_pct" DECIMAL(5,2),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "monthly_snapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recurring_items" (
    "id" SERIAL NOT NULL,
    "description" VARCHAR(255) NOT NULL,
    "amount_gs" DECIMAL(15,2),
    "amount_usd" DECIMAL(10,2),
    "category_id" INTEGER NOT NULL,
    "essentiality_id" INTEGER NOT NULL,
    "payment_method" "PaymentMethod" NOT NULL,
    "frequency" "RecurringFrequency" NOT NULL,
    "billing_day" SMALLINT,
    "billing_month" SMALLINT,
    "is_variable" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recurring_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categories_code_key" ON "categories"("code");

-- CreateIndex
CREATE UNIQUE INDEX "essentiality_levels_code_key" ON "essentiality_levels"("code");

-- CreateIndex
CREATE UNIQUE INDEX "budgets_month_category_id_key" ON "budgets"("month", "category_id");

-- CreateIndex
CREATE UNIQUE INDEX "monthly_snapshot_month_key" ON "monthly_snapshot"("month");

-- AddForeignKey
ALTER TABLE "installment_plans" ADD CONSTRAINT "installment_plans_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "installment_plans" ADD CONSTRAINT "installment_plans_essentiality_id_fkey" FOREIGN KEY ("essentiality_id") REFERENCES "essentiality_levels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_essentiality_id_fkey" FOREIGN KEY ("essentiality_id") REFERENCES "essentiality_levels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_exchange_rate_id_fkey" FOREIGN KEY ("exchange_rate_id") REFERENCES "exchange_rates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_installment_plan_id_fkey" FOREIGN KEY ("installment_plan_id") REFERENCES "installment_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_essentiality_id_fkey" FOREIGN KEY ("essentiality_id") REFERENCES "essentiality_levels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monthly_snapshot" ADD CONSTRAINT "monthly_snapshot_exchange_rate_id_fkey" FOREIGN KEY ("exchange_rate_id") REFERENCES "exchange_rates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurring_items" ADD CONSTRAINT "recurring_items_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurring_items" ADD CONSTRAINT "recurring_items_essentiality_id_fkey" FOREIGN KEY ("essentiality_id") REFERENCES "essentiality_levels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
