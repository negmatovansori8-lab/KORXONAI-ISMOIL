import { env } from "../config/env";
import fs from "fs";

fs.mkdirSync(env.backupDir, { recursive: true });
console.log("Backup job placeholder. Trigger POST /api/storage/backup from Admin.");
