import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { env } from "./config/env";
import { authRouter } from "./modules/auth";
import { apiRouter } from "./modules/api";
import { exportRouter } from "./modules/export";
import { storageRouter } from "./modules/storage";
import { errorHandler } from "./middleware/error";

export const app = express();

app.set("trust proxy", 1);

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    frameguard: false,
  })
);
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const allowed = env.corsOrigins;
      if (allowed.includes("*")) return callback(null, true);
      if (allowed.some((o) => origin === o || origin.endsWith(".vercel.app") || origin.endsWith(".telegram.org"))) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "2mb" }));
app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));
app.use(
  "/api/auth/login",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 40,
    standardHeaders: true,
    legacyHeaders: false,
    validate: { xForwardedForHeader: false },
  })
);

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "oems-api", time: new Date().toISOString() });
});

app.use("/api/auth", authRouter);
app.use("/api/export", exportRouter);
app.use("/api/storage", storageRouter);
app.use("/api", apiRouter);

app.use(errorHandler);
