/*
  Warnings:

  - You are about to drop the column `type` on the `groups_table` table. All the data in the column will be lost.
  - Added the required column `host` to the `groups_table` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `groups_table` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "groups_table" DROP COLUMN "type",
ADD COLUMN     "host" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL;
