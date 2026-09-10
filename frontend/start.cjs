const { spawn } = require("child_process");

const port = process.env.PORT || "3000";
const child = spawn("npx", ["next", "start", "-H", "0.0.0.0", "-p", String(port)], {
  stdio: "inherit",
  shell: true,
});

child.on("exit", (code) => process.exit(code ?? 0));
