/*
  Warnings:

  - The primary key for the `activities_table` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `details` on the `activities_table` table. All the data in the column will be lost.
  - You are about to drop the column `timestamp` on the `activities_table` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `activities_table` table. All the data in the column will be lost.
  - You are about to drop the column `userid` on the `activities_table` table. All the data in the column will be lost.
  - You are about to drop the column `weight` on the `activities_table` table. All the data in the column will be lost.
  - Added the required column `description` to the `activities_table` table without a default value. This is not possible if the table is not empty.
  - The required column `id` was added to the `activities_table` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `title` to the `activities_table` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `activities_table` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "activities_table" DROP CONSTRAINT "activities_table_pkey",
DROP COLUMN "details",
DROP COLUMN "timestamp",
DROP COLUMN "type",
DROP COLUMN "userid",
DROP COLUMN "weight",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "created_by" INTEGER,
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD CONSTRAINT "activities_table_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "subtopics_table" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "activity_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subtopics_table_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_members_table" (
    "activity_id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "activity_members_table_pkey" PRIMARY KEY ("activity_id","user_id")
);

-- CreateTable
CREATE TABLE "subtopic_completions_table" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "subtopic_id" TEXT NOT NULL,
    "completed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subtopic_completions_table_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "subtopic_completions_table_user_id_subtopic_id_key" ON "subtopic_completions_table"("user_id", "subtopic_id");

-- AddForeignKey
ALTER TABLE "activities_table" ADD CONSTRAINT "activities_table_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subtopics_table" ADD CONSTRAINT "subtopics_table_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "activities_table"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_members_table" ADD CONSTRAINT "activity_members_table_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "activities_table"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_members_table" ADD CONSTRAINT "activity_members_table_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subtopic_completions_table" ADD CONSTRAINT "subtopic_completions_table_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subtopic_completions_table" ADD CONSTRAINT "subtopic_completions_table_subtopic_id_fkey" FOREIGN KEY ("subtopic_id") REFERENCES "subtopics_table"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
