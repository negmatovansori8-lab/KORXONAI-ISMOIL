import fs from "fs";
import path from "path";
import { execFile } from "child_process";
import { promisify } from "util";
import { Router } from "express";
import multer from "multer";
import { env } from "../config/env";
import { authenticate, authorize } from "../middleware/auth";
import { Role } from "../types/roles";

const execFileAsync = promisify(execFile);

fs.mkdirSync(env.uploadDir, { recursive: true });
fs.mkdirSync(env.backupDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, env.uploadDir),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`),
});

export const upload = multer({ storage, limits: { fileSize: 15 * 1024 * 1024 } });
export const storageRouter = Router();
storageRouter.use(authenticate);

storageRouter.post("/upload", authorize(Role.ADMIN, Role.MANAGER), upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file" });
  res.json({
    filename: req.file.filename,
    path: `/api/storage/files/${req.file.filename}`,
    size: req.file.size,
  });
});

storageRouter.get("/files/:name", (req, res) => {
  const file = path.join(env.uploadDir, path.basename(req.params.name));
  if (!fs.existsSync(file)) return res.status(404).json({ error: "Not found" });
  res.sendFile(file);
});

storageRouter.post("/backup", authorize(Role.ADMIN, Role.CEO), async (_req, res) => {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  if (env.databaseUrl.startsWith("file:")) {
    const src = env.databaseUrl.replace("file:", "");
    const dest = path.join(env.backupDir, `oems-${stamp}.db`);
    fs.copyFileSync(path.resolve(process.cwd(), src), dest);
    return res.json({ file: path.basename(dest), createdAt: new Date().toISOString() });
  }
  const file = path.join(env.backupDir, `oems-${stamp}.sql`);
  const url = new URL(env.databaseUrl.replace("?schema=public", ""));
  try {
    await execFileAsync("pg_dump", [
      "-h",
      url.hostname,
      "-p",
      url.port || "5432",
      "-U",
      url.username,
      "-d",
      url.pathname.replace("/", ""),
      "-f",
      file,
    ], { env: { ...process.env, PGPASSWORD: decodeURIComponent(url.password) } });
    res.json({ file: path.basename(file), createdAt: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ error: "Backup failed", detail: err instanceof Error ? err.message : err });
  }
});

storageRouter.get("/backups", authorize(Role.ADMIN, Role.CEO), (_req, res) => {
  const files = fs.readdirSync(env.backupDir).map((name) => ({
    name,
    size: fs.statSync(path.join(env.backupDir, name)).size,
  }));
  res.json(files);
});
