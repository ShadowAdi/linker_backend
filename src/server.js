import express from "express";
import cors from "cors";
import { healthRouter } from "./routes/healthRouter.js";
import { configDotenv } from "dotenv";
import { logger } from "./utils/logger.js";
import { CustomErrorHandler } from "./middleware/errorHandler.js";
import { userRouter } from "./routes/userRouter.js";
import { linkRouter } from "./routes/linkRouter.js";
configDotenv();
const PORT = process.env.PORT;
const app = express();

app.use(
  cors({
    origin: "https://linker-frontend-ten.vercel.app/",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

app.use("/api/health", healthRouter);
app.use("/api/user", userRouter);
app.use("/api/links", linkRouter);

app.use(CustomErrorHandler);

try {
  app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
    console.log(`Server is running on port ${PORT}`);
  });
} catch (err) {
  logger.error("Server failed to start due to DB error:", err.message);
  console.error("Server failed to start due to DB error:", err.message);
  process.exit(1);
}
