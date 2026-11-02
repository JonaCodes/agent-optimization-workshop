import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { parseEnv } from "node:util";
import { loadLocalEnvironment, saveSettings, settingsRoot } from "../local-settings.mjs";
import { readModelConfig } from "../model-config.mjs";
import { createPrompt } from "./setup-prompt.mjs";

export async function verifySetupModel(config, {
  root = settingsRoot, environment = process.env, check, ask, log = console.log,
} = {}) {
  if (config.provider !== "azure") return config;
  check ??= (await import("./model-check.mjs")).checkModelAccess;
  log("Checking Azure authentication, deployment access, and tool calling (one model request)...");
  try {
    await check(config);
  } catch (error) {
    if (![401, 403].includes(error.statusCode)) throw error;
    log(`Azure authentication or access was rejected (HTTP ${error.statusCode}). Check the key and resource permissions.`);
    // Forbidden can mean valid credentials without deployment access; do not replace them.
    if (error.statusCode === 403) throw new Error("Azure access was denied (HTTP 403). Check resource permissions and network restrictions, then rerun setup.");
    if (await keyIsOverridden(root, environment)) {
      throw new Error("Correct AZURE_API_KEY in your shell or .env.development.local, then rerun setup. That override takes precedence over saved settings.");
    }
    const prompt = ask ? undefined : createPrompt();
    ask ??= prompt.ask;
    let key;
    try {
      key = (await ask("Azure rejected the key. Enter a replacement (hidden; Enter stops setup)", { secret: true })).trim();
    } finally { prompt?.close(); }
    if (!key) throw new Error("Azure authentication failed (HTTP 401). Correct the key and rerun setup.");
    await saveSettings({ AZURE_API_KEY: key }, root);
    config = readModelConfig(await loadLocalEnvironment({ ...environment }, root));
    // Exactly one correction attempt; the shared checker never retries requests.
    await check(config);
  }
  log("Azure authentication, deployment access, and tool calling verified.");
  return config;
}

async function keyIsOverridden(root, environment) {
  if (environment.AZURE_API_KEY !== undefined) return true;
  let text;
  try { text = await readFile(resolve(root, ".env.development.local"), "utf8"); }
  catch (error) { if (error.code === "ENOENT") return false; throw error; }
  return Object.hasOwn(parseEnv(text), "AZURE_API_KEY");
}
