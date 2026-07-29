-- AlterTable
ALTER TABLE "sessions" ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "sessions_pkey" PRIMARY KEY ("id");

