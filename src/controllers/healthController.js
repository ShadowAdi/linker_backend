import { CustomTryCatch } from "../utils/CustomTryCatch";

export const healthCheck = CustomTryCatch((_, res) => {
  return res.status(200).json({
    message: "API Is working successfylly",
    success: true,
  });
});
