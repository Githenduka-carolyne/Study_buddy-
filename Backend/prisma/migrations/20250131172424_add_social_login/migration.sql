/*
  Warnings:

  - You are about to drop the `users_table` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "users_table";

-- CreateTable
CREATE TABLE "Users" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "emailAddress" TEXT NOT NULL,
    "phoneNumber" INTEGER NOT NULL,
    "Password" TEXT NOT NULL,
    "socialProvider" TEXT,
    "socialProviderId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_emailAddress_key" ON "Users"("emailAddress");
