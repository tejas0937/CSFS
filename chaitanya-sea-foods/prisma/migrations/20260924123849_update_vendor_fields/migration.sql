/*
  Warnings:

  - You are about to drop the column `contactPerson` on the `Vendor` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `Vendor` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Vendor" DROP COLUMN "contactPerson",
DROP COLUMN "email",
ADD COLUMN     "location" TEXT,
ADD COLUMN     "managedById" TEXT,
ADD COLUMN     "shipName" TEXT;

-- CreateIndex
CREATE INDEX "Vendor_managedById_idx" ON "Vendor"("managedById");

-- AddForeignKey
ALTER TABLE "Vendor" ADD CONSTRAINT "Vendor_managedById_fkey" FOREIGN KEY ("managedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
