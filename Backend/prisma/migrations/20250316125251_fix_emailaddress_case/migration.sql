/*
  Warnings:

  - You are about to drop the column `emailAddress` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[emailaddress]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "users_emailAddress_key";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "emailAddress",
ADD COLUMN     "emailaddress" VARCHAR(255) NOT NULL DEFAULT '';

-- CreateIndex
CREATE UNIQUE INDEX "users_emailaddress_key" ON "users"("emailaddress");
