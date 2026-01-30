/*
  Warnings:

  - A unique constraint covering the columns `[userId,fromemail]` on the table `Sender` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Sender_userId_fromemail_key" ON "Sender"("userId", "fromemail");
