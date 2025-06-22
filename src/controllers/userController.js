import { prismaClient } from "../db/prisma.js";
import { AppError } from "../utils/AppError.js";
import { CustomTryCatch } from "../utils/CustomTryCatch.js";
import { logger } from "../utils/logger.js";
import bcrypt from "bcrypt";
import { TokenGenerator } from "../utils/TokenGenerator.js";

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

  await prismaClient.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
    },
  });
  return res.status(201).json({
    success: true,
    message: "User Is Created",
  });
});

export const LoginUser = CustomTryCatch(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
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
  if (!user) {
    logger.error(`User don't exists with the mail: ${email}. Try To Register`);
    return next(
      new AppError(
        `User already exists with the mail: ${email}. Try To Register`,
        404
      )
    );
  }
  const isPasswordCorrect = await bcrypt.compare(password, user.password);
  if (!isPasswordCorrect) {
    logger.error(`Invalid Credentials`);
    return next(new AppError(`Invalid Credentials`, 401));
  }

  const payload = {
    email: user.email,
    sub: user.id,
  };

  const token = await TokenGenerator(payload);
  return res.status(200).json({
    token: token,
    user,
    success: true,
    message: "Login Successfull",
  });
});
