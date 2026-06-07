-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "recurring_item_id" INTEGER;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_recurring_item_id_fkey" FOREIGN KEY ("recurring_item_id") REFERENCES "recurring_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;
