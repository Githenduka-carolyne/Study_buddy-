/*
  Warnings:

  - You are about to drop the column `Password` on the `Users` table. All the data in the column will be lost.
  - You are about to drop the `groups_table` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "Users" DROP COLUMN "Password",
ADD COLUMN     "lastLogin" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "password" TEXT NOT NULL DEFAULT '',
ALTER COLUMN "phoneNumber" DROP NOT NULL;

-- DropTable
DROP TABLE "groups_table";

-- CreateTable
CREATE TABLE "study_groups_table" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" INTEGER NOT NULL,

    CONSTRAINT "study_groups_table_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "group_members_table" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "group_id" INTEGER NOT NULL,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "role" TEXT NOT NULL DEFAULT 'member',

    CONSTRAINT "group_members_table_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "group_messages_table" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,
    "groupId" INTEGER NOT NULL,

    CONSTRAINT "group_messages_table_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "group_members_table_user_id_group_id_key" ON "group_members_table"("user_id", "group_id");

-- AddForeignKey
ALTER TABLE "study_groups_table" ADD CONSTRAINT "study_groups_table_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_members_table" ADD CONSTRAINT "group_members_table_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_members_table" ADD CONSTRAINT "group_members_table_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "study_groups_table"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_messages_table" ADD CONSTRAINT "group_messages_table_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_messages_table" ADD CONSTRAINT "group_messages_table_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "study_groups_table"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
