import { prismaClient } from "../db/prisma.js";
import { AppError } from "../utils/AppError.js";
import { CustomTryCatch } from "../utils/CustomTryCatch.js";
import { logger } from "../utils/logger.js";

export const CreateFolder = CustomTryCatch(async (req, res, next) => {
  const user = req.user;
  if (!user || !user.sub) {
    logger.error(`Failed to get the authenticated user`);
    return next(new AppError(`Failed to get the authenticated user`, 404));
  }

  const userId = user.sub;

  const userFound = await prismaClient.user.findUnique({
    where: { id: userId },
  });
  if (!userFound) {
    logger.error(`User with id does not exist: ${userId}`);
    return next(new AppError(`User with id does not exist: ${userId}`, 404));
  }

  const data = req.body;
  if (!data.folderName) {
    logger.error(`Folder name not provided`);
    return next(new AppError(`Folder name not provided`, 404));
  }
  const isFolderAlreadyExist = await prismaClient.folders.findUnique({
    where: {
      userId: user.sub,
      folderName: data.folderName,
    },
  });
  if (isFolderAlreadyExist) {
    logger.error(`Folder name already exists`);
    return next(new AppError(`Folder name already exists`, 400));
  }
  const folder = await prismaClient.folders.create({
    data: {
      folderName: data.folderName,
      folderCoverImage: data.folderCoverImage || undefined,
      folderDescription: data.folderDescription || undefined,
      folderProfileImage: data.folderProfileImage || undefined,
      isPublishable: data.isPublishable === true,
      folderShareUrl: data.folderShareUrl || undefined,
      userId: userId,
      folderTags: Array.isArray(data.folderTags) ? data.folderTags : [],
    },
  });
  return res.status(201).json({
    success: true,
    message: "Folder created successfully",
    data: folder,
  });
});

export const GetAllFolders = CustomTryCatch(async (req, res, next) => {
  const user = req.user;
  if (!user || !user.sub) {
    logger.error(`Failed to get the authenticated user`);
    return next(new AppError(`Failed to get the authenticated user`, 404));
  }

  const userId = user.sub;

  const userFound = await prismaClient.user.findUnique({
    where: { id: userId },
  });
  if (!userFound) {
    logger.error(`User with id does not exist: ${userId}`);
    return next(new AppError(`User with id does not exist: ${userId}`, 404));
  }

  const { isPublishable, tag, folderName } = req.query;

  const where = {
    userId,
    ...(isPublishable !== undefined
      ? { isPublishable: isPublishable === "true" }
      : {}),
    ...(folderName
      ? { folderName: { contains: folderName, mode: "insensitive" } }
      : {}),
    ...(tag ? { folderTags: { has: tag } } : {}),
  };

  const folders = await prismaClient.folders.findMany({
    where,
    select: {
      id: true,
      folderName: true,
      folderCoverImage: true,
      folderDescription: true,
      folderProfileImage: true,
      folderTags: true,
      isPublishable: true,
      folderShareUrl: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          profileUrl: true,
        },
      },
      followers: {
        select: {
          id: true,
          name: true,
          email: true,
          profileUrl: true,
        },
      },
      _count: {
        select: {
          Links: true,
          folderDiscussions: true,
        },
      },
    },
  });

  return res.status(200).json({
    success: true,
    data: folders,
  });
});

export const GetFolder = CustomTryCatch(async (req, res, next) => {
  const user = req.user;
  if (!user || !user.sub) {
    logger.error(`Failed to get the authenticated user`);
    return next(new AppError(`Failed to get the authenticated user`, 404));
  }

  const userId = user.sub;

  const userFound = await prismaClient.user.findUnique({
    where: { id: userId },
  });
  if (!userFound) {
    logger.error(`User with id does not exist: ${userId}`);
    return next(new AppError(`User with id does not exist: ${userId}`, 404));
  }

  const { folderId } = req.query;
  if (!folderId) {
    logger.error(`Folder Id Not Provided`);
    return next(new AppError(`Folder Id Not Provided`, 404));
  }

  const folder = await prismaClient.folders.findFirst({
    where: { id: parseInt(folderId) },
    select: {
      id: true,
      folderName: true,
      folderCoverImage: true,
      folderDescription: true,
      folderProfileImage: true,
      folderTags: true,
      isPublishable: true,
      folderShareUrl: true,
      createdAt: true,
      updatedAt: true,

      // owner
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          profileUrl: true,
        },
      },

      // followers
      followers: {
        select: {
          id: true,
          name: true,
          email: true,
          profileUrl: true,
        },
      },

      // folder collaborators
      folderCollaborators: {
        select: {
          id: true,
          role: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              profileUrl: true,
            },
          },
        },
      },

      // folder discussions with count of messages
      folderDiscussions: {
        select: {
          id: true,
          name: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: { messages: true },
          },
        },
      },

      // folder invites
      folderInvites: {
        select: {
          id: true,
          invitedEmail: true,
          status: true,
          token: true,
          createdAt: true,
          expiresAt: true,
          inviter: {
            select: {
              id: true,
              name: true,
              email: true,
              profileUrl: true,
            },
          },
        },
      },

      // links (full data or partial)
      Links: {
        select: {
          id: true,
          url: true,
          title: true,
          imageUrl: true,
          domain: true,
          summary: true,
          tags: true,
          createdAt: true,
          updatedAt: true,
          lastStatus: true,
          lastStatusCode: true,
          isOnline: true,
        },
      },
    },
  });

  if (!folder) {
    logger.error(`Folder with id does not exist: ${folderId}`);
    return next(
      new AppError(`Folder with id does not exist: ${folderId}`, 404)
    );
  }

  return res.status(200).json({
    success: true,
    data: folder,
  });
});

export const DeleteFolder = CustomTryCatch(async (req, res, next) => {
  const user = req.user;
  if (!user || !user.sub) {
    logger.error(`Failed to get the authenticated user`);
    return next(new AppError(`Failed to get the authenticated user`, 404));
  }

  const userId = user.sub;

  const userFound = await prismaClient.user.findUnique({
    where: { id: userId },
  });
  if (!userFound) {
    logger.error(`User with id does not exist: ${userId}`);
    return next(new AppError(`User with id does not exist: ${userId}`, 404));
  }

  const folderId = Number(req.query.folderId);
  if (!folderId || isNaN(folderId)) {
    logger.error(`Invalid or missing Folder Id`);
    return next(new AppError(`Invalid or missing Folder Id`, 400));
  }

  const folder = await prismaClient.folders.findUnique({
    where: { id: folderId },
  });
  if (!folder) {
    return next(new AppError(`Folder does not exist: ${folderId}`, 404));
  }
  if (folder.userId !== userId) {
    return next(new AppError(`Not authorized to delete this folder`, 403));
  }

  await prismaClient.$transaction([
    prismaClient.discussionMessages.deleteMany({
      where: {
        discussion: {
          folderId: folderId,
        },
      },
    }),
    prismaClient.folderDiscussions.deleteMany({
      where: {
        folderId: folderId,
      },
    }),
    prismaClient.folderCollaborator.deleteMany({
      where: {
        folderId: folderId,
      },
    }),
    prismaClient.folderInvite.deleteMany({
      where: {
        folderId: folderId,
      },
    }),
    prismaClient.links.deleteMany({
      where: {
        folderId: folderId,
      },
    }),
    prismaClient.folders.delete({
      where: {
        id: folderId,
      },
    }),
  ]);
  return res.status(200).json({
    message: "Folder deleted successfully",
    success: true,
  });
});

export const UpdateFolder = CustomTryCatch(async (req, res, next) => {
  const user = req.user;
  if (!user || !user.sub) {
    logger.error(`Failed to get the authenticated user`);
    return next(new AppError(`Failed to get the authenticated user`, 404));
  }

  const userId = user.sub;

  const userFound = await prismaClient.user.findUnique({
    where: { id: userId },
  });
  if (!userFound) {
    logger.error(`User with id does not exist: ${userId}`);
    return next(new AppError(`User with id does not exist: ${userId}`, 404));
  }

  const folderId = Number(req.query.folderId);
  if (!folderId || isNaN(folderId)) {
    logger.error(`Invalid or missing Folder Id`);
    return next(new AppError(`Invalid or missing Folder Id`, 400));
  }

  const folder = await prismaClient.folders.findUnique({
    where: { id: folderId },
  });
  if (!folder) {
    return next(new AppError(`Folder does not exist: ${folderId}`, 404));
  }
  if (folder.userId !== userId) {
    return next(new AppError(`Not authorized to delete this folder`, 403));
  }

  const data = req.body;
  const updateData = {};
  if (data.folderName !== undefined) updateData.folderName = data.folderName;
  if (data.folderCoverImage !== undefined)
    updateData.folderCoverImage = data.folderCoverImage;
  if (data.folderProfileImage !== undefined)
    updateData.folderProfileImage = data.folderProfileImage;
  if (data.folderDescription !== undefined)
    updateData.folderDescription = data.folderDescription;
  if (data.folderTags !== undefined) updateData.folderTags = data.folderTags;
  if (data.isPublishable !== undefined)
    updateData.isPublishable = data.isPublishable;
  if (data.folderShareUrl !== undefined)
    updateData.folderShareUrl = data.folderShareUrl;

  const updatedFolder = await prismaClient.folders.update({
    where: {
      id: folderId,
    },
    data: updateData,
  });

  return res.status(200).json({
    message: "Folder updated successfully",
    success: true,
    updatedFolder,
  });
});
