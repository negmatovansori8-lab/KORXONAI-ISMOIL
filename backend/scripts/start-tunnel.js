const fs = require("fs");
const path = require("path");
const { bin, install, Tunnel } = require("cloudflared");

const urlFile = path.resolve(__dirname, "../../.miniapp-url");

(async () => {
  if (!fs.existsSync(bin)) {
    console.log("Installing cloudflared binary...");
    await install(bin);
    console.log("Binary ready:", bin);
  }
  const t = Tunnel.quick("http://127.0.0.1:3001");
  t.on("url", (url) => {
    console.log("TUNNEL_URL=" + url);
    fs.writeFileSync(urlFile, String(url).trim() + "\n", "utf8");
  });
  t.on("connected", (c) => console.log("connected", c && c.location));
  t.on("error", (e) => console.error("tunnel error", e));
  t.on("stderr", (d) => process.stderr.write(String(d)));
  t.on("stdout", (d) => process.stdout.write(String(d)));
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
