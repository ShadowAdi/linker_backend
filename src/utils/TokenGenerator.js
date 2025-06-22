import { logger } from "./logger.js";
import { AppError } from "./AppError.js";
import jwt from "jsonwebtoken";
import { configDotenv } from "dotenv";
configDotenv();

export const TokenGenerator = async (payload) => {
  try {
    const Jwt_Secret = process.env.JWT_SECRET;
    if (!Jwt_Secret) {
      console.log("Jwt Secret Key is not found ", Jwt_Secret);
      logger.error("Jwt Secret Key is not found " + Jwt_Secret);
      throw new AppError(`Internal Server Error`, 500);
    }
    const token = jwt.sign(payload, Jwt_Secret, {
      algorithm: "HS256",
      expiresIn: "7d",
    });
    return token;
  } catch (error) {
    console.log("Some Error in creating Token ", error);
    logger.error("Error in creating Token  " + error);
     throw new AppError(`Internal Server Error`, 500);
  }
};
