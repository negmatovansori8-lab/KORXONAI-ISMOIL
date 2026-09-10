import dns from "dns";
import fs from "fs";
import path from "path";
import { env } from "../config/env";
import { COMPANY } from "../config/company";

dns.setDefaultResultOrder("ipv4first");

const URL_FILE = path.resolve(__dirname, "../../../.miniapp-url");

function miniappUrl() {
  try {
    if (fs.existsSync(URL_FILE)) {
      const fromFile = fs.readFileSync(URL_FILE, "utf8").trim();
      if (fromFile) return fromFile.replace(/\/$/, "");
    }
  } catch {
    /* ignore */
  }
  return (env.miniappUrl ?? "").replace(/\/$/, "");
}

async function tg(method: string, body?: Record<string, unknown>) {
  const res = await fetch(`https://api.telegram.org/bot${env.telegramBotToken}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: body ? JSON.stringify(body) : "{}",
  });
  return (await res.json()) as { ok: boolean; result?: unknown; description?: string };
}

async function publishMenu(url: string) {
  await tg("setChatMenuButton", {
    menu_button: {
      type: "web_app",
      text: "Кушодан",
      web_app: { url },
    },
  });
}

async function greet(chatId: number) {
  const url = miniappUrl();
  if (!url) {
    await tg("sendMessage", {
      chat_id: chatId,
      text: `${COMPANY.name}\nРаис: ${COMPANY.ceo}\n\nMini App ҳоло оғоз мешавад. 10 сония интизор шавед ва /start-ро аз нав фиристед.`,
    });
    return;
  }
  await publishMenu(url);
  await tg("sendMessage", {
    chat_id: chatId,
      text: `${COMPANY.name}\nРаис: ${COMPANY.ceo}\n\nНефт — сарвати миллат.\nТугмаи поёнро пахш кунед — Mini App кушода мешавад.`,
    reply_markup: {
      inline_keyboard: [[{ text: "Кушодани Mini App", web_app: { url } }]],
    },
  });
}

export async function startTelegramBot() {
  if (!env.telegramBotToken) {
    console.log("Telegram bot skipped (TELEGRAM_BOT_TOKEN missing)");
    return;
  }

  await tg("setMyCommands", {
    commands: [
      { command: "start", description: "Кушодани Mini App" },
      { command: "app", description: "KORXONAI NEFTI TOJIK" },
    ],
  });
  await tg("setMyDescription", {
    description: `${COMPANY.name} — Нефт — сарвати миллат. Молия, истеҳсолот, кадрҳо ва анбор. Раис: ${COMPANY.ceo}.`,
  });
  await tg("setMyShortDescription", {
    short_description: `Нефт — сарвати миллат`,
  });

  const initial = miniappUrl();
  if (initial) {
    await publishMenu(initial);
    console.log(`Telegram Mini App menu -> ${initial}`);
  }

  let offset = 0;
  let lastUrl = initial;
  console.log("Telegram bot polling @cimohbot");

  for (;;) {
    try {
      const url = miniappUrl();
      if (url && url !== lastUrl) {
        await publishMenu(url);
        lastUrl = url;
        console.log(`Telegram Mini App menu -> ${url}`);
      }

      const data = (await tg("getUpdates", { offset, timeout: 25 })) as {
        ok: boolean;
        result?: Array<{ update_id: number; message?: { chat: { id: number }; text?: string } }>;
        description?: string;
      };
      if (!data.ok) {
        console.error("Telegram getUpdates failed", data.description);
        await new Promise((r) => setTimeout(r, 4000));
        continue;
      }
      for (const update of data.result ?? []) {
        offset = update.update_id + 1;
        const text = update.message?.text ?? "";
        if (text.startsWith("/start") || text.startsWith("/app")) {
          await greet(update.message!.chat.id);
        }
      }
    } catch (err) {
      console.error("Telegram poll error", err);
      await new Promise((r) => setTimeout(r, 4000));
    }
  }
}
