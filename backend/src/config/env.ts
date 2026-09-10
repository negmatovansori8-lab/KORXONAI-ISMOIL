import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 4000),
  jwtSecret: process.env.JWT_SECRET ?? "dev-only-secret-change-me",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "12h",
  corsOrigins: (process.env.CORS_ORIGIN ?? "http://localhost:3000,http://localhost:3001")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
  uploadDir: process.env.UPLOAD_DIR ?? path.resolve(process.cwd(), "uploads"),
  backupDir: process.env.BACKUP_DIR ?? path.resolve(process.cwd(), "backups"),
  databaseUrl: process.env.DATABASE_URL ?? "",
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN ?? "",
  miniappUrl: process.env.MINIAPP_URL ?? "",
};
