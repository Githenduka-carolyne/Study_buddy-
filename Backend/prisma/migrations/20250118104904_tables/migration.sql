-- CreateTable
CREATE TABLE "users_table" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "emailAddress" TEXT NOT NULL,
    "phoneNumber" INTEGER NOT NULL,
    "Password" TEXT NOT NULL,

    CONSTRAINT "users_table_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activities_table" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,

    CONSTRAINT "activities_table_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "groups_table" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "groups_table_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_table_emailAddress_key" ON "users_table"("emailAddress");

-- CreateIndex
CREATE UNIQUE INDEX "users_table_phoneNumber_key" ON "users_table"("phoneNumber");
