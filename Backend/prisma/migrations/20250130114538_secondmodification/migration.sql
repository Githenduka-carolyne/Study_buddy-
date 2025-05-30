/*
  Warnings:

  - The primary key for the `activities_table` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `activities_table` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `activities_table` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `activities_table` table. All the data in the column will be lost.
  - Added the required column `timestamp` to the `activities_table` table without a default value. This is not possible if the table is not empty.
  - The required column `userid` was added to the `activities_table` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `weight` to the `activities_table` table without a default value. This is not possible if the table is not empty.
  - Added the required column `members` to the `groups_table` table without a default value. This is not possible if the table is not empty.
  - Added the required column `activityscore` to the `users_table` table without a default value. This is not possible if the table is not empty.
  - Added the required column `studygroups` to the `users_table` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "activities_table" DROP CONSTRAINT "activities_table_pkey",
DROP COLUMN "createdAt",
DROP COLUMN "id",
DROP COLUMN "updatedAt",
ADD COLUMN     "timestamp" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "userid" TEXT NOT NULL,
ADD COLUMN     "weight" INTEGER NOT NULL,
ADD CONSTRAINT "activities_table_pkey" PRIMARY KEY ("userid");

-- AlterTable
ALTER TABLE "groups_table" ADD COLUMN     "members" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users_table" ADD COLUMN     "activityscore" INTEGER NOT NULL,
ADD COLUMN     "studygroups" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "message_table" (
    "groupid" SERIAL NOT NULL,
    "sender" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "message_table_pkey" PRIMARY KEY ("groupid")
);
