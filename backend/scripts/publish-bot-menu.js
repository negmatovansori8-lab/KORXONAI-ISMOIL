const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const token = process.env.TELEGRAM_BOT_TOKEN;
const url = fs.readFileSync(path.resolve(__dirname, "../../.miniapp-url"), "utf8").trim().replace(/\/$/, "");

if (!token) {
  console.error("NO_TOKEN");
  process.exit(1);
}

async function tg(method, body) {
  const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(body ?? {}),
  });
  return res.json();
}

(async () => {
  const me = await tg("getMe", {});
  if (!me.ok) {
    console.error("GETME_FAIL", me.description || "unknown");
    process.exit(1);
  }
  console.log("BOT_OK @" + (me.result.username || me.result.id));
  await tg("deleteWebhook", { drop_pending_updates: false });
  const menu = await tg("setChatMenuButton", {
    menu_button: { type: "web_app", text: "Кушодан", web_app: { url } },
  });
  console.log(menu.ok ? "MENU_OK " + url : "MENU_FAIL " + (menu.description || ""));
})().catch((err) => {
  console.error("BOT_ERR", err.message);
  process.exit(1);
});
