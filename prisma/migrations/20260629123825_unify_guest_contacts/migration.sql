-- AlterTable
ALTER TABLE "guests" ADD COLUMN     "blast_sent_at" TIMESTAMP(3),
ADD COLUMN     "group" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "note" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "phone" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "source" TEXT NOT NULL DEFAULT 'manual',
ALTER COLUMN "attending" DROP NOT NULL,
ALTER COLUMN "attending" DROP DEFAULT;

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "invitation_id" TEXT;

-- AlterTable
ALTER TABLE "payment_proofs" ADD COLUMN     "order_id" TEXT;

-- CreateIndex
CREATE INDEX "payment_proofs_order_id_idx" ON "payment_proofs"("order_id");
