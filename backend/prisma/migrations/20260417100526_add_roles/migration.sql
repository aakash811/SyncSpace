/*
  Warnings:

  - Changed the type of `role` on the `BoardMember` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('OWNER', 'EDITOR', 'VIEWER');

-- AlterTable
ALTER TABLE "BoardMember" DROP COLUMN "role",
ADD COLUMN     "role" "Role" NOT NULL;
