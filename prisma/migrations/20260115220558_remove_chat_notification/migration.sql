/*
  Warnings:

  - You are about to drop the `notifications` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `private_call_participants` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `private_calls` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `private_conversations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `private_message_statuses` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `private_messages` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_notifications` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "private_call_participants" DROP CONSTRAINT "private_call_participants_callId_fkey";

-- DropForeignKey
ALTER TABLE "private_call_participants" DROP CONSTRAINT "private_call_participants_userId_fkey";

-- DropForeignKey
ALTER TABLE "private_calls" DROP CONSTRAINT "private_calls_conversationId_fkey";

-- DropForeignKey
ALTER TABLE "private_calls" DROP CONSTRAINT "private_calls_initiatorId_fkey";

-- DropForeignKey
ALTER TABLE "private_conversations" DROP CONSTRAINT "private_conversations_initiatorId_fkey";

-- DropForeignKey
ALTER TABLE "private_conversations" DROP CONSTRAINT "private_conversations_lastMessageId_fkey";

-- DropForeignKey
ALTER TABLE "private_conversations" DROP CONSTRAINT "private_conversations_receiverId_fkey";

-- DropForeignKey
ALTER TABLE "private_message_statuses" DROP CONSTRAINT "private_message_statuses_messageId_fkey";

-- DropForeignKey
ALTER TABLE "private_message_statuses" DROP CONSTRAINT "private_message_statuses_userId_fkey";

-- DropForeignKey
ALTER TABLE "private_messages" DROP CONSTRAINT "private_messages_conversationId_fkey";

-- DropForeignKey
ALTER TABLE "private_messages" DROP CONSTRAINT "private_messages_fileId_fkey";

-- DropForeignKey
ALTER TABLE "private_messages" DROP CONSTRAINT "private_messages_senderId_fkey";

-- DropForeignKey
ALTER TABLE "user_notifications" DROP CONSTRAINT "user_notifications_notificationId_fkey";

-- DropForeignKey
ALTER TABLE "user_notifications" DROP CONSTRAINT "user_notifications_userId_fkey";

-- DropTable
DROP TABLE "notifications";

-- DropTable
DROP TABLE "private_call_participants";

-- DropTable
DROP TABLE "private_calls";

-- DropTable
DROP TABLE "private_conversations";

-- DropTable
DROP TABLE "private_message_statuses";

-- DropTable
DROP TABLE "private_messages";

-- DropTable
DROP TABLE "user_notifications";

-- DropEnum
DROP TYPE "CallParticipantStatus";

-- DropEnum
DROP TYPE "CallStatus";

-- DropEnum
DROP TYPE "CallType";

-- DropEnum
DROP TYPE "ConversationStatus";

-- DropEnum
DROP TYPE "MessageDeliveryStatus";

-- DropEnum
DROP TYPE "MessageType";
