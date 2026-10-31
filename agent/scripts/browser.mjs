import { createHash } from "node:crypto";
import { constants } from "node:fs";
import { access } from "node:fs/promises";
import { resolve } from "node:path";
import { agentRoot, setupCommand } from "./runtime.mjs";

export const chromeBuild = "156.0.8078.80";

export async function browserOptions() {
  const { Browser, detectBrowserPlatform } =
    await import("@puppeteer/browsers");
  const platform = detectBrowserPlatform();
  if (!platform || (process.platform === "linux" && process.arch !== "x64")) {
    throw new Error(
      `Chrome ${chromeBuild} requires macOS/Windows x64 or arm64, or Ubuntu/Debian Linux x64.`,
    );
  }
  return {
    browser: Browser.CHROME,
    buildId: chromeBuild,
    platform,
    cacheDir: resolve(agentRoot, ".browsers"),
  };
}

export function launchEnvironment(executablePath, environment = process.env) {
  const inherited = Object.fromEntries(
    Object.entries(environment).filter(
      ([name]) => !name.toUpperCase().startsWith("AGENT_BROWSER_"),
    ),
  );
  return {
    ...inherited,
    AGENT_BROWSER_CONFIG: resolve(agentRoot, "scripts/browser-config.json"),
    AGENT_BROWSER_EXECUTABLE_PATH: executablePath,
    AGENT_BROWSER_ENGINE: "chrome",
    AGENT_BROWSER_NAMESPACE: `ws-${createHash("sha256").update(`${agentRoot}:${chromeBuild}`).digest("hex").slice(0, 8)}`,
  };
}

export async function browserEnvironment() {
  const { computeExecutablePath } = await import("@puppeteer/browsers");
  const executablePath = computeExecutablePath(await browserOptions());
  try {
    await access(executablePath, constants.X_OK);
  } catch {
    throw new Error(
      `Chrome ${chromeBuild} is missing or not executable. Run: ${setupCommand}`,
    );
  }
  return launchEnvironment(executablePath);
}
