import { spawn } from "node:child_process";
import { resolve } from "node:path";
import { createServer } from "vite";

const root = resolve(import.meta.dirname, "..");
const server = await createServer({
  root,
  server: { host: "127.0.0.1", port: 4173, strictPort: true },
  logLevel: "error",
});

let exitCode = 1;
try {
  await server.listen();
  exitCode = await new Promise((resolveExit, reject) => {
    const child = spawn(
      process.execPath,
      [resolve(root, "node_modules", "@playwright", "test", "cli.js"), "test", "--workers=1"],
      {
        cwd: root,
        stdio: "inherit",
        env: { ...process.env, PLAYWRIGHT_EXTERNAL_SERVER: "1" },
      },
    );
    child.once("error", reject);
    child.once("exit", (code) => resolveExit(code ?? 1));
  });
} finally {
  await server.close();
}

process.exitCode = exitCode;
