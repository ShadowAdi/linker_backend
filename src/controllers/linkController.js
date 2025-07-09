import { prismaClient } from "../db/prisma.js";
import { AppError } from "../utils/AppError.js";
import { CustomTryCatch } from "../utils/CustomTryCatch.js";
import { logger } from "../utils/logger.js";
import axios from "axios";
import * as cheerio from "cheerio";

export const GetAllLinks = CustomTryCatch(async (req, res, next) => {
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
      Links: true,
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
  const userLinks = await prismaClient.links.findMany({
    where: { userId: userFound.id },
  });
  return res.status(200).json({
    success: true,
    userLinks,
  });
});

export const CreateLink = CustomTryCatch(async (req, res, next) => {
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

  const folderId = Number(req.params.folderId);
  if (!folderId || isNaN(folderId)) {
    logger.error(`Invalid or missing Folder Id`);
    return next(new AppError(`Invalid or missing Folder Id`, 400));
  }

  const folderFound = await prismaClient.folders.findFirst({
    where: {
      id: folderId,
    },
  });

  if (!folderFound) {
    logger.error(`Folder not found`);
    return next(new AppError(`Folder Not Found`, 400));
  }

  const { url, pingInterval } = req.body;
  let { tags, summary } = req.body;
  if (!url) {
    logger.error(`Failed to get the url`);
    console.log(`Failed to get the url`);
    return next(new AppError(`Failed to get the url`, 404));
  }

  const response = await axios.get(`${url}`);
  const html = response.data;

  const $ = cheerio.load(html);

  const title =
    $('meta[property="og:title"]').attr("content") ||
    $("title").text() ||
    "No Title Found";

  const imageUrl =
    $('meta[property="og:image"]').attr("content") ||
    "https://via.placeholder.com/300";

  const domain = new URL(url).hostname.replace("www.", "");

  const userLinks = await prismaClient.links.create({
    data: {
      url,
      title: title,
      domain: domain,
      summary: null,
      imageUrl: imageUrl,
      tags: [],
      folderId: folderId,
      pingInterval: pingInterval || 3000,
    },
  });

  return res.status(200).json({
    success: true,
    userLinks,
    message: "Link is created",
  });
});

export const GetSingleLink = CustomTryCatch(async (req, res, next) => {
  const user = req.user;
  const linkId = req.params.linkId;
  if (!linkId) {
    logger.error(`Failed to get the link id`);
    console.log(`Failed to get the link id`);
    return next(new AppError(`Failed to get the link id`, 404));
  }
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
      id: true,
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
  const linkFound = await prismaClient.links.findFirstOrThrow({
    where: { userId: userFound.id, id: linkId },
  });
  if (!linkFound) {
    logger.error(`Link not found with id: ${id}`);
    console.log(`Link not found with id: ${id}`);
    return next(new AppError(`Link not found with id: ${id}`, 404));
  }

  return res.status(200).json({
    success: true,
    linkFound,
  });
});
