-- CreateTable
CREATE TABLE "recurring_item_skips" (
    "id" SERIAL NOT NULL,
    "recurring_item_id" INTEGER NOT NULL,
    "month" DATE NOT NULL,
    "reason" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recurring_item_skips_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "recurring_item_skips_recurring_item_id_month_key" ON "recurring_item_skips"("recurring_item_id", "month");

-- AddForeignKey
ALTER TABLE "recurring_item_skips" ADD CONSTRAINT "recurring_item_skips_recurring_item_id_fkey" FOREIGN KEY ("recurring_item_id") REFERENCES "recurring_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
