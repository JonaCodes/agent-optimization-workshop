import { spawn } from "node:child_process";
import { access, readFile } from "node:fs/promises";
import { constants } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const agentRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const workshopRoot = resolve(agentRoot, "..");
export const eveCli = resolve(agentRoot, "node_modules/eve/bin/eve.js");
export const browserCli = resolve(
  agentRoot,
  "node_modules/agent-browser/bin/agent-browser.js",
);
export const setupCommand = "npm --prefix agent run init-setup";
export const packageJson = JSON.parse(
  await readFile(resolve(agentRoot, "package.json"), "utf8"),
);

export function checkNodeVersion(nodeVersion = process.versions.node) {
  if (Number(nodeVersion.split(".")[0]) < 24) {
    throw new Error(
      `Node.js 24 or newer is required; found ${nodeVersion}. Install Node.js 24+ and rerun the command.`,
    );
  }
}

export async function checkRuntime() {
  checkNodeVersion();
  if (
    !["darwin", "linux", "win32"].includes(process.platform) ||
    !["x64", "arm64"].includes(process.arch) ||
    (process.platform === "linux" && process.arch !== "x64")
  ) {
    throw new Error(
      `Unsupported browser platform: ${process.platform}-${process.arch}. Use macOS/Windows x64 or arm64, or Ubuntu/Debian Linux x64.`,
    );
  }
}

export async function checkDependencies(root = agentRoot) {
  for (const [name, expected] of Object.entries({
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  })) {
    let installed;
    try {
      installed = JSON.parse(
        await readFile(
          resolve(root, "node_modules", name, "package.json"),
          "utf8",
        ),
      ).version;
    } catch {
      throw new Error(`Missing dependency ${name}. Run: ${setupCommand}`);
    }
    if (installed !== expected) {
      throw new Error(
        `Expected ${name}@${expected}; found ${installed}. Run: ${setupCommand}`,
      );
    }
  }
}

export async function checkLoginPrerequisites(provider = "chatgpt") {
  if (provider !== "chatgpt" || process.platform !== "linux") return;
  try {
    await access("/usr/bin/secret-tool", constants.X_OK);
  } catch {
    throw new Error(
      "ChatGPT login requires secret-tool on Linux. Run: sudo apt-get update && sudo apt-get install -y libsecret-tools gnome-keyring dbus-user-session. Use a desktop session with an unlocked Secret Service keyring.",
    );
  }
}

export function runNode(script, args, options = {}) {
  return new Promise((resolveRun, reject) => {
    const child = spawn(process.execPath, [script, ...args], {
      cwd: agentRoot,
      stdio: "inherit",
      ...options,
    });
    child.once("error", reject);
    child.once("exit", (code, signal) => {
      if (code === 0) resolveRun();
      else reject(new Error(`${script} failed (${signal ?? `exit ${code}`}).`));
    });
  });
}

export async function reportFailure(action) {
  try {
    await action();
  } catch (error) {
    console.error(`\nWorkshop: ${error.message}`);
    process.exitCode = 1;
  }
}
