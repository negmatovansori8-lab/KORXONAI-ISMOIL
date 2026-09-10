import { app } from "./app";
import { env } from "./config/env";
import { prisma } from "./lib/prisma";
import { startTelegramBot } from "./modules/telegram";
import { seedDatabase } from "../prisma/seed";

async function start() {
  await prisma.$connect();

  if (process.env.SEED_ON_BOOT !== "false") {
    const users = await prisma.user.count();
    if (users === 0) {
      console.log("Empty database — seeding demo data...");
      await seedDatabase();
    }
  }

  app.listen(env.port, "0.0.0.0", () => {
    console.log(`KORXONAI NEFTI TOJIK API listening on :${env.port}`);
    startTelegramBot().catch((err) => console.error("Telegram bot failed", err));
  });
}

start().catch((err) => {
  console.error("Failed to start API", err);
  process.exit(1);
});
