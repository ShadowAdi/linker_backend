import { prismaClient } from "../db/prisma.js";
import { AppError } from "../utils/AppError.js";
import { CustomTryCatch } from "../utils/CustomTryCatch.js";
import { logger } from "../utils/logger.js";
import bcrypt from "bcrypt";
import { TokenGenerator } from "../utils/TokenGenerator.js";

export const CreateUser = CustomTryCatch(async (req, res, next) => {
  const { name, email, password, profileUrl, bio, socialLinks } = req.body;
  if (!email || !password || !name) {
    logger.error(
      "Fields are not provided email: " +
        email +
        " and password is: " +
        password
    );
    return next(
      new AppError(
        `Required Data is not present Email:${email},password:${password}`,
        404
      )
    );
  }

  const user = await prismaClient.user.findUnique({ where: { email: email } });
  if (user) {
    logger.error(`User already exists with the mail: ${email}`);
    return next(
      new AppError(`User already exists with the mail: ${email}`, 404)
    );
  }
  const hashedPassword = await bcrypt.hash(password, 10);

  const socialLinksArray =
    socialLinks && typeof socialLinks === "object"
      ? Object.entries(socialLinks).map(([key, value]) => ({
          key,
          value,
        }))
      : [];

  await prismaClient.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      profileUrl: profileUrl || undefined,
      bio: bio || undefined,
      socialLinks: socialLinksArray.length
        ? { create: socialLinksArray }
        : undefined,
    },
  });
  return res.status(201).json({
    success: true,
    message: "User Is Created",
  });
});

export const LoginUser = CustomTryCatch(async (req, res, next) => {
  const { email, password: bodyPassword } = req.body;
  if (!email || !bodyPassword) {
    logger.error(
      "Fields are not provided email: " +
        email +
        " and password is: " +
        password
    );
    return next(
      new AppError(
        `Required Data is not present Email:${email},password:${bodyPassword}`,
        404
      )
    );
  }

  const user = await prismaClient.user.findUnique({ where: { email: email } });
  if (!user) {
    logger.error(`User don't exists with the mail: ${email}. Try To Register`);
    return next(
      new AppError(
        `User already exists with the mail: ${email}. Try To Register`,
        404
      )
    );
  }
  const isPasswordCorrect = await bcrypt.compare(bodyPassword, user.password);
  if (!isPasswordCorrect) {
    logger.error(`Invalid Credentials`);
    return next(new AppError(`Invalid Credentials`, 401));
  }

  const payload = {
    email: user.email,
    sub: user.id,
  };

  const { password, ...data } = user;

  const token = await TokenGenerator(payload);
  return res.status(200).json({
    token: token,
    data,
    success: true,
    message: "Login Successfull",
  });
});

export const AuthenticatedUser = CustomTryCatch(async (req, res, next) => {
  const user = req.user;
  if (!user) {
    logger.error(`Failed to get the authenticated user ${user}`);
    console.log(`Failed to get the authenticated user ${user}`);
    return next(
      new AppError(`Failed to get the authenticated user ${user}`, 404)
    );
  }
  const { email, sub } = user;
  if (!sub) {
    logger.error(`Failed to get the authenticated user ${sub}`);
    console.log(`Failed to get the authenticated user ${sub}`);
    return next(
      new AppError(`Failed to get the authenticated user ${sub}`, 404)
    );
  }
  const userFound = await prismaClient.user.findUnique({
    where: { id: sub },
    select: {
      email: true,
      createdAt: true,
      id: true,
      name: true,
      bio: true,
      profileUrl: true,

      socialLinks: {
        select: {
          key: true,
          value: true,
        },
      },

      folders: {
        select: {
          folderCoverImage: true,
          folderDescription: true,
          folderName: true,
          folderTags: true,
          folderProfileImage: true,
          folderShareUrl: true,
          isPublishable: true,

          followers: {
            select: {
              name: true,
              id: true,
              profileUrl: true,
            },
          },

          _count: {
            select: {
              Links: true,
            },
          },
        },
      },

      _count: {
        select: {
          folders: true,
        },
      },
    },
  });

  if (!userFound) {
    logger.error(`User With Id Do Not Exist: ${sub}`);
    console.log(`User With Id Do Not Exist: ${sub}`);
    return next(new AppError(`User With Id Do Not Exist: ${sub}`, 404));
  }
  if (userFound.email !== email) {
    logger.error(`User With email Do Not Exist: ${email}`);
    console.log(`User With email Do Not Exist: ${email}`);
    return next(new AppError(`User With email Do Not Exist: ${email}`, 404));
  }
  return res.status(200).json({
    statusCode: 200,
    user: userFound,
    message: "User Found",
    success: true,
  });
});

export const UpdateUser = CustomTryCatch(async (req, res, next) => {
  const user = req.user;
  if (!user) {
    logger.error(`Failed to get the authenticated user ${user}`);
    console.log(`Failed to get the authenticated user ${user}`);
    return next(
      new AppError(`Failed to get the authenticated user ${user}`, 404)
    );
  }
  const { sub } = user;
  if (!sub) {
    logger.error(`Failed to get the authenticated user ${sub}`);
    console.log(`Failed to get the authenticated user ${sub}`);
    return next(
      new AppError(`Failed to get the authenticated user ${sub}`, 404)
    );
  }
  const userFound = await prismaClient.user.findUnique({
    where: { id: sub },
  });
  if (!userFound) {
    logger.error(`User With Id Do Not Exist: ${sub}`);
    console.log(`User With Id Do Not Exist: ${sub}`);
    return next(new AppError(`User With Id Do Not Exist: ${sub}`, 404));
  }

  const data = req.body;
  const updateData = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.bio !== undefined) updateData.bio = data.bio;
  if (data.profileUrl !== undefined) updateData.profileUrl = data.profileUrl;

  await prismaClient.user.update({
    where: { id: user.sub },
    data: updateData,
  });

  if (data.socialLinks && typeof data.socialLinks === "object") {
    const socialLinksArray = Object.entries(data.socialLinks).map([key, value]);
    await prismaClient.socialMediaUrls.deleteMany({
      where: {
        userId: sub,
      },
    });

    if (socialLinksArray.length) {
      await prismaClient.socialMediaUrls.createMany({
        data: socialLinksArray.map((link) => ({
          ...link,
          userId: user.sub,
        })),
      });
    }
  }
  return res.status(200).json({
    success: true,
    message: "User is updated",
  });
});

export const DeleteUser = CustomTryCatch(async (req, res, next) => {
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

  await prismaClient.$transaction([
    prismaClient.folderCollaborator.deleteMany({
      where: { userId },
    }),
    prismaClient.folderInvite.deleteMany({
      where: { inviterId: userId },
    }),
    prismaClient.discussionMessages.deleteMany({
      where: { userId },
    }),
    prismaClient.folderDiscussions.deleteMany({
      where: { userId },
    }),
    prismaClient.profiles.deleteMany({
      where: { userId },
    }),
    prismaClient.socialMediaUrls.deleteMany({
      where: { userId },
    }),
    prismaClient.folders.deleteMany({
      where: { userId },
    }),
    prismaClient.user.delete({
      where: { id: userId },
    }),
  ]);

  return res.status(200).json({
    message: "User is deleted",
    success: true,
  });
});
