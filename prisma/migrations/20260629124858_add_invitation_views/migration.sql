-- CreateTable
CREATE TABLE "invitation_views" (
    "id" TEXT NOT NULL,
    "invitation_id" TEXT NOT NULL,
    "viewed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "referrer" TEXT NOT NULL DEFAULT '',
    "user_agent" TEXT NOT NULL DEFAULT '',
    "country" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "invitation_views_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "invitation_views_invitation_id_idx" ON "invitation_views"("invitation_id");

-- CreateIndex
CREATE INDEX "invitation_views_viewed_at_idx" ON "invitation_views"("viewed_at");

-- AddForeignKey
ALTER TABLE "invitation_views" ADD CONSTRAINT "invitation_views_invitation_id_fkey" FOREIGN KEY ("invitation_id") REFERENCES "invitations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
