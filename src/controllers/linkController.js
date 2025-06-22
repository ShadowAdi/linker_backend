import { prismaClient } from "../db/prisma";
import { CustomTryCatch } from "../utils/CustomTryCatch";
import { UserCheckAbstraction } from "../utils/userAbstracted";

export const GetAllLinks = CustomTryCatch(async (req, res, next) => {
  const userFound = await UserCheckAbstraction(req,next);
  const userLinks = await prismaClient.links.findMany({
    where: { userId: userFound.id },
  });
  return res.status(200).json({
    success: true,
    userLinks,
  });
});

