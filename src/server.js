import express from "express";
import cors from "cors";
import { healthRouter } from "./routes/healthRouter.js";
import { CustomErrorHandler } from "./middlewares/errorHandler.js";
import { configDotenv } from "dotenv";
import { logger } from "./utils/logger.js";
configDotenv();
const PORT = process.env.PORT;
const app = express();

app.use(
  cors({
    allowedHeaders: true,
    methods: ["*"],
    origin: ["*"],
  })
);
app.use(express.json());

app.use("/api/health", healthRouter);

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
