/*
  Warnings:

  - You are about to drop the column `activityscore` on the `users_table` table. All the data in the column will be lost.
  - You are about to drop the column `studygroups` on the `users_table` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users_table" DROP COLUMN "activityscore",
DROP COLUMN "studygroups";
