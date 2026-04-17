/*
  Warnings:

  - A unique constraint covering the columns `[userId,boardId]` on the table `BoardMember` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "BoardMember_userId_boardId_key" ON "BoardMember"("userId", "boardId");
