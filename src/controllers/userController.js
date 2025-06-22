import { prismaClient } from "../db/prisma";
import { AppError } from "../utils/AppError";
import { CustomTryCatch } from "../utils/CustomTryCatch";
import { logger } from "../utils/logger";

export const CreateUser = CustomTryCatch(async (req, res, next) => {
  const { name, email, password } = req.body;
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

  const data = await prismaClient.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
    },
  });
  return res.status(201).json({
    success: true,
    message: "Yser Is Created",
    user: data,
  });
});
