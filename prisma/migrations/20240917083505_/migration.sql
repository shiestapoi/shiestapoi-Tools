-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "tokenLogin" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chat" (
    "id" TEXT NOT NULL,
    "chatObjectid" TEXT NOT NULL,
    "nameContact" TEXT NOT NULL,
    "chatId" JSONB NOT NULL,
    "message" TEXT NOT NULL,
    "messageType" TEXT,
    "mediaFile" BYTEA,
    "mediaUrl" TEXT,
    "pesanPrivate" BOOLEAN NOT NULL DEFAULT true,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "backup" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Chat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatSetting" (
    "id" TEXT NOT NULL,
    "chatObjectid" TEXT NOT NULL,
    "nameContact" TEXT NOT NULL,
    "backup" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ChatSetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
