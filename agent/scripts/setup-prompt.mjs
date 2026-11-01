import { createInterface } from "node:readline/promises";
import { emitKeypressEvents } from "node:readline";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { readModelConfig, validateAzureSetting } from "../model-config.mjs";
import { loadLocalEnvironment, saveSettings, settingsRoot, managedKeys } from "../local-settings.mjs";

export async function configureSetup({ root = settingsRoot, environment = process.env, ask, log = console.log } = {}) {
  const prompt = ask ? undefined : createPrompt();
  ask ??= prompt.ask;
  try {
    const effective = await loadLocalEnvironment({ ...environment }, root);
    const defaults = JSON.parse(await readFile(resolve(root, "workshop-defaults.json"), "utf8"));
    const current = effective.WORKSHOP_PROVIDER || "chatgpt";
    const provider = await choose(ask, "Provider (chatgpt / azure)", current, ["chatgpt", "azure"]);
    const settings = { WORKSHOP_PROVIDER: provider };
    if (provider === "azure") {
      const configured = hasAzureSettings({ ...effective, WORKSHOP_PROVIDER: "azure" });
      const reuse = configured
        ? await choose(ask, "Saved Azure settings: keep or update?", "keep", ["keep", "update"])
        : "update";
      for (const key of managedKeys.filter((key) => key.startsWith("AZURE_") && key !== "AZURE_API_KEY")) {
        const value = effective[key] || defaults[key] || "";
        const valid = isValidSetting(key, value);
        if (value && !valid) log(`Check ${key}: its saved or workshop value is invalid.`);
        settings[key] = reuse === "keep" || (!configured && valid)
          ? value
          : await askSetting(ask, key, valid ? value : "", log);
      }
      const existingKey = effective.AZURE_API_KEY;
      settings.AZURE_API_KEY = reuse === "keep"
        ? existingKey
        : await required(ask, existingKey
          ? "Azure API key (hidden; Enter keeps saved key)"
          : "Azure API key (hidden)", existingKey, true);
    }
    readModelConfig(settings);
    await saveSettings(settings, root);
    const next = await loadLocalEnvironment({ ...environment }, root);
    const overridden = Object.keys(settings).filter((key) => next[key] !== settings[key]);
    if (overridden.length) log(`Saved settings are overridden by your shell or .env.development.local: ${overridden.join(", ")}. Remove those overrides to use setup settings.`);
    log("Provider settings saved locally. No model request was sent.");
    return readModelConfig(next);
  } finally { prompt?.close(); }
}

const labels = {
  AZURE_OPENAI_ENDPOINT: "Azure resource endpoint (ask organizer if unknown)",
  AZURE_OPENAI_DEPLOYMENT: "Azure deployment name (ask organizer if unknown)",
  AZURE_OPENAI_CONTEXT_WINDOW: "Azure context limit in tokens (ask organizer if unknown)",
  AZURE_OPENAI_API: "Azure API (responses / chat)",
};

function hasAzureSettings(environment) {
  try { readModelConfig(environment); return true; } catch { return false; }
}

function isValidSetting(key, value) {
  try { validateAzureSetting(key, value); return true; }
  catch { return false; }
}

async function askSetting(ask, key, fallback, log) {
  for (;;) {
    const value = (await ask(labels[key], { fallback })).trim() || fallback;
    try {
      validateAzureSetting(key, value);
      return value;
    } catch (error) {
      log(error.message);
    }
  }
}

async function choose(ask, label, fallback, choices) {
  for (;;) {
    const answer = (await ask(label, { fallback })).trim().toLowerCase() || fallback;
    if (choices.includes(answer)) return answer;
  }
}

async function required(ask, label, fallback = "", secret = false) {
  for (;;) {
    const answer = (await ask(label, { fallback: secret ? "" : fallback, secret })).trim();
    if (answer || fallback) return answer || fallback;
  }
}

export function createPrompt(input = process.stdin, output = process.stdout) {
  if (!input.isTTY || !output.isTTY) throw new Error("Run init-setup in an interactive terminal to choose your provider and enter credentials securely.");
  let active;
  return {
    async ask(label, { fallback = "", secret = false } = {}) {
      if (secret) return hiddenQuestion(input, output, `${label}: `);
      active = createInterface({ input, output });
      const controller = new AbortController();
      active.on("SIGINT", () => controller.abort());
      active.on("close", () => controller.abort());
      try { return await active.question(`${label}${fallback ? ` [${fallback}]` : ""}: `, { signal: controller.signal }); }
      catch { throw new Error("Setup cancelled. Existing settings were kept."); }
      finally { active.close(); active = undefined; }
    },
    close() { active?.close(); },
  };
}

export function hiddenQuestion(input, output, label) {
  output.write(label);
  emitKeypressEvents(input);
  const wasRaw = input.isRaw;
  input.setRawMode(true);
  input.resume();
  return new Promise((resolveAnswer, reject) => {
    let value = "";
    const finish = (error) => {
      input.off("keypress", onKey);
      input.off("end", onEnd);
      input.setRawMode(wasRaw);
      input.pause();
      output.write("\n");
      if (error) reject(error); else resolveAnswer(value);
    };
    const onEnd = () => finish(new Error("Setup cancelled. Existing settings were kept."));
    const onKey = (text, key = {}) => {
      if ((key.ctrl && ["c", "d"].includes(key.name)) || key.name === "escape") return onEnd();
      if (["return", "enter"].includes(key.name)) return finish();
      if (key.name === "backspace") value = Array.from(value).slice(0, -1).join("");
      else if (text && !key.ctrl && !key.meta && !/[\x00-\x1f\x7f]/.test(text)) value += text;
    };
    input.on("keypress", onKey);
    input.once("end", onEnd);
  });
}
