import { AppError } from "../utils/AppError.js";
import { logger } from "../utils/logger.js";
import jwt from "jsonwebtoken";

export const CheckAuth = async (req, res, next) => {
  const Jwt_Secret = process.env.JWT_SECRET;
  if (!Jwt_Secret) {
    console.log("Jwt Secret Key is not found ", Jwt_Secret);
    logger.error("Jwt Secret Key is not found " + Jwt_Secret);
    return next(AppError(`Internal Server Error`, 500));
  }
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      const message = `Token not provided or invalid format. Header: ${authHeader}`;
      logger.error(message);
      return next(new AppError(message, 401));
    }

    const token = authHeader.split(" ")[1];

    if (!Jwt_Secret) {
      logger.error("JWT secret key not found.");
      return next(new AppError("Internal server error", 500));
    }

    const decoded = jwt.verify(token, Jwt_Secret);
    req.user = decoded;
    next();
  } catch (error) {
    logger.error("Error in checking auth: " + error.message);
    return next(new AppError("Unauthorized access", 401));
  }
};
