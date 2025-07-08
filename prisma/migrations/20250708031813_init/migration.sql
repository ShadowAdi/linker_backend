-- CreateEnum
CREATE TYPE "LastStatus" AS ENUM ('OK', 'TIMEOUT_ERROR', 'DNS_ERROR', 'SERVER_ERROR', 'ERROR');

-- CreateEnum
CREATE TYPE "CollaboratorRole" AS ENUM ('OWNER', 'EDITOR', 'VIEWER');

-- CreateEnum
CREATE TYPE "InviteStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED');

-- CreateTable
CREATE TABLE "SocialMediaUrls" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocialMediaUrls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "profileUrl" TEXT,
    "bio" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Folders" (
    "id" SERIAL NOT NULL,
    "folderName" TEXT NOT NULL,
    "folderCoverImage" TEXT,
    "folderProfileImage" TEXT,
    "folderDescription" TEXT,
    "folderTags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isPublishable" BOOLEAN NOT NULL DEFAULT false,
    "folderShareUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Folders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Links" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "imageUrl" TEXT,
    "domain" TEXT NOT NULL,
    "summary" TEXT,
    "pingInterval" INTEGER NOT NULL DEFAULT 3000,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "lastCheckedAt" TEXT,
    "lastStatus" "LastStatus" NOT NULL,
    "lastStatusCode" INTEGER NOT NULL,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "folderId" INTEGER NOT NULL,
    "isSpam" BOOLEAN NOT NULL DEFAULT false,
    "isMalicious" BOOLEAN NOT NULL DEFAULT false,
    "threatLevel" INTEGER,
    "riskDescription" TEXT,
    "isAdult" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profiles" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "title" TEXT NOT NULL,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "isEditable" BOOLEAN NOT NULL DEFAULT false,
    "tags" TEXT[],
    "canCopiedByOthers" BOOLEAN NOT NULL DEFAULT false,
    "copyCount" INTEGER NOT NULL DEFAULT 0,
    "hits" INTEGER NOT NULL DEFAULT 0,
    "unHits" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FolderCollaborator" (
    "id" SERIAL NOT NULL,
    "folderId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "role" "CollaboratorRole" NOT NULL DEFAULT 'VIEWER',

    CONSTRAINT "FolderCollaborator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FolderDiscussions" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "folderId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "FolderDiscussions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiscussionMessages" (
    "id" SERIAL NOT NULL,
    "discussionId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isEdited" BOOLEAN NOT NULL DEFAULT false,
    "parentMessageId" INTEGER,

    CONSTRAINT "DiscussionMessages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FolderInvite" (
    "id" SERIAL NOT NULL,
    "folderId" INTEGER NOT NULL,
    "invitedEmail" TEXT NOT NULL,
    "inviterId" INTEGER NOT NULL,
    "status" "InviteStatus" NOT NULL DEFAULT 'PENDING',
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FolderInvite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_UserFollowFolders" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_UserFollowFolders_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_LinksToProfiles" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_LinksToProfiles_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Folders_folderName_key" ON "Folders"("folderName");

-- CreateIndex
CREATE UNIQUE INDEX "FolderCollaborator_folderId_userId_key" ON "FolderCollaborator"("folderId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "FolderInvite_token_key" ON "FolderInvite"("token");

-- CreateIndex
CREATE INDEX "_UserFollowFolders_B_index" ON "_UserFollowFolders"("B");

-- CreateIndex
CREATE INDEX "_LinksToProfiles_B_index" ON "_LinksToProfiles"("B");

-- AddForeignKey
ALTER TABLE "SocialMediaUrls" ADD CONSTRAINT "SocialMediaUrls_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Folders" ADD CONSTRAINT "Folders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Links" ADD CONSTRAINT "Links_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "Folders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Profiles" ADD CONSTRAINT "Profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FolderCollaborator" ADD CONSTRAINT "FolderCollaborator_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "Folders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FolderCollaborator" ADD CONSTRAINT "FolderCollaborator_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FolderDiscussions" ADD CONSTRAINT "FolderDiscussions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FolderDiscussions" ADD CONSTRAINT "FolderDiscussions_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "Folders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscussionMessages" ADD CONSTRAINT "DiscussionMessages_discussionId_fkey" FOREIGN KEY ("discussionId") REFERENCES "FolderDiscussions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscussionMessages" ADD CONSTRAINT "DiscussionMessages_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscussionMessages" ADD CONSTRAINT "DiscussionMessages_parentMessageId_fkey" FOREIGN KEY ("parentMessageId") REFERENCES "DiscussionMessages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FolderInvite" ADD CONSTRAINT "FolderInvite_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "Folders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FolderInvite" ADD CONSTRAINT "FolderInvite_inviterId_fkey" FOREIGN KEY ("inviterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserFollowFolders" ADD CONSTRAINT "_UserFollowFolders_A_fkey" FOREIGN KEY ("A") REFERENCES "Folders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserFollowFolders" ADD CONSTRAINT "_UserFollowFolders_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LinksToProfiles" ADD CONSTRAINT "_LinksToProfiles_A_fkey" FOREIGN KEY ("A") REFERENCES "Links"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LinksToProfiles" ADD CONSTRAINT "_LinksToProfiles_B_fkey" FOREIGN KEY ("B") REFERENCES "Profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
