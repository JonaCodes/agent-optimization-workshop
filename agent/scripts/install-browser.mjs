import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { browserOptions, chromeBuild } from "./browser.mjs";
import { reportFailure } from "./runtime.mjs";

await reportFailure(async () => {
  const { install } = await import("@puppeteer/browsers");
  const linux = process.platform === "linux";
  const root = linux && process.getuid() === 0;
  console.log(`Installing Chrome for Testing ${chromeBuild}…`);
  await install({ ...(await browserOptions()), installDeps: root });
  if (!linux || root) return;

  // The browser is already cached under the participant's account. Elevate
  // only the cached install's system-library step, never npm installation.
  console.log("Installing Chrome system libraries with sudo (Ubuntu/Debian)…");
  await new Promise((resolveInstall, reject) => {
    const child = spawn(
      "sudo",
      [process.execPath, fileURLToPath(import.meta.url)],
      { stdio: "inherit" },
    );
    child.once("error", reject);
    child.once("exit", (code, signal) =>
      code === 0
        ? resolveInstall()
        : reject(
            new Error(
              `Linux browser libraries could not be installed (${signal ?? `exit ${code}`}). Check sudo and apt-get access.`,
            ),
          ),
    );
  });
});
