import { createHash } from "node:crypto";
import { constants } from "node:fs";
import { access } from "node:fs/promises";
import { resolve } from "node:path";
import { agentRoot } from "./runtime.mjs";

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

async function pinnedExecutablePath() {
  const { computeExecutablePath } = await import("@puppeteer/browsers");
  return computeExecutablePath(await browserOptions());
}

async function stableChromeExecutablePath() {
  const { Browser, ChromeReleaseChannel, computeSystemExecutablePath } =
    await import("@puppeteer/browsers");
  const { platform } = await browserOptions();
  return computeSystemExecutablePath({
    browser: Browser.CHROME,
    platform,
    channel: ChromeReleaseChannel.STABLE,
  });
}

export async function browserCandidates({
  platform = process.platform,
  getPinnedPath = pinnedExecutablePath,
  getStablePath = stableChromeExecutablePath,
} = {}) {
  const pinnedPath = await getPinnedPath();
  const candidates = [{ executablePath: pinnedPath, source: "pinned" }];
  if (platform !== "win32") return candidates;

  try {
    const stablePath = await getStablePath();
    if (stablePath !== pinnedPath) {
      candidates.push({ executablePath: stablePath, source: "system stable" });
    }
  } catch {
    // Windows fallback is optional; the pinned browser remains the preference.
  }
  return candidates;
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
    AGENT_BROWSER_NAMESPACE: `ws-${createHash("sha256")
      .update(`${agentRoot}:${executablePath}`)
      .digest("hex")
      .slice(0, 8)}`,
  };
}

export async function isExecutable(executablePath) {
  try {
    await access(executablePath, constants.X_OK);
    return true;
  } catch {
    return false;
  }
}

export function missingBrowserError(executablePath) {
  return new Error(`Chrome is missing or not executable at ${executablePath}.`);
}
