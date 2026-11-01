import assert from "node:assert/strict";
import test from "node:test";
import { mkdtemp, readFile, writeFile, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { EventEmitter } from "node:events";
import { parseEnv } from "node:util";
import { loadLocalEnvironment, saveSettings, readSavedSettings } from "../../local-settings.mjs";
import { configureSetup, hiddenQuestion } from "../setup-prompt.mjs";
import { readModelConfig } from "../../model-config.mjs";

const azure = {
  WORKSHOP_PROVIDER: "azure",
  AZURE_OPENAI_ENDPOINT: "https://example.openai.azure.com/",
  AZURE_OPENAI_DEPLOYMENT: "workshop",
  AZURE_OPENAI_CONTEXT_WINDOW: "128000",
  AZURE_OPENAI_API: "responses",
  AZURE_API_KEY: "fake-only-key",
};
async function fixture(t, defaults = {}) {
  const root = await mkdtemp(join(tmpdir(), "workshop-setup-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await writeFile(join(root, "workshop-defaults.json"), JSON.stringify(defaults));
  return root;
}
function answers(values, prompts = []) {
  return async (label, options) => {
    prompts.push({ label, ...options });
    assert.ok(values.length, `Unexpected prompt: ${label}`);
    return values.shift();
  };
}

test("loader matches Eve file order and preserves host overrides", async (t) => {
  const root = await fixture(t);
  for (const [name, value] of [[".env", "base"], [".env.development", "development"], [".env.local", "local"], [".env.development.local", "highest"]]) {
    await writeFile(join(root, name), `ORDER='${value}'\n`);
  }
  assert.equal((await loadLocalEnvironment({}, root)).ORDER, "highest");
  assert.equal((await loadLocalEnvironment({ ORDER: "host" }, root)).ORDER, "host");
  assert.equal((await loadLocalEnvironment({ ORDER: "" }, root)).ORDER, "");
});

test("atomic settings save preserves unrelated data and saved key during provider switch", async (t) => {
  const root = await fixture(t);
  await writeFile(join(root, ".env.local"), "# keep me\nUNRELATED='first\nsecond'\nEMPTY=\nOTHER=ok\n");
  await saveSettings(azure, root);
  await saveSettings({ WORKSHOP_PROVIDER: "chatgpt" }, root);
  const text = await readFile(join(root, ".env.local"), "utf8");
  assert.ok(text.includes("# keep me\nUNRELATED='first\nsecond'\nEMPTY=\nOTHER=ok"));
  const saved = parseEnv(text);
  assert.equal(saved.AZURE_API_KEY, azure.AZURE_API_KEY);
  assert.equal(saved.WORKSHOP_PROVIDER, "chatgpt");
  assert.equal(saved.EMPTY, "");
  if (process.platform !== "win32") assert.equal((await stat(join(root, ".env.local"))).mode & 0o777, 0o600);
});

test("first Azure setup with defaults asks only provider and hidden key; fresh launch loads Azure", async (t) => {
  const { WORKSHOP_PROVIDER, AZURE_API_KEY, ...defaults } = azure;
  const root = await fixture(t, defaults);
  const prompts = [], logs = [];
  const config = await configureSetup({ root, environment: {}, ask: answers(["azure", AZURE_API_KEY], prompts), log: (line) => logs.push(line) });
  assert.equal(config.provider, "azure");
  assert.equal(prompts.length, 2);
  assert.equal(prompts[1].secret, true);
  assert.doesNotMatch(JSON.stringify(prompts) + logs.join(), /fake-only-key/);
  assert.equal(readModelConfig(await loadLocalEnvironment({}, root)).provider, "azure");
});

test("missing organizer defaults are prompted and saved", async (t) => {
  const root = await fixture(t, { AZURE_OPENAI_API: "responses" });
  const prompts = [];
  await configureSetup({ root, environment: {}, ask: answers(["azure", azure.AZURE_OPENAI_ENDPOINT, azure.AZURE_OPENAI_DEPLOYMENT, azure.AZURE_OPENAI_CONTEXT_WINDOW, azure.AZURE_API_KEY], prompts), log() {} });
  assert.equal(prompts.length, 5);
  assert.deepEqual(await readSavedSettings(root), azure);
});

test("reruns keep complete settings without key prompt and switching back reuses key", async (t) => {
  const root = await fixture(t);
  await saveSettings(azure, root);
  await configureSetup({ root, environment: {}, ask: answers(["", "keep"]), log() {} });
  await configureSetup({ root, environment: {}, ask: answers(["chatgpt"]), log() {} });
  await configureSetup({ root, environment: {}, ask: answers(["azure", "keep"]), log() {} });
  assert.equal((await readSavedSettings(root)).AZURE_API_KEY, azure.AZURE_API_KEY);
});

test("update permits blank key to retain it without displaying its value", async (t) => {
  const root = await fixture(t);
  await saveSettings(azure, root);
  const prompts = [];
  await configureSetup({ root, environment: {}, ask: answers(["", "update", "", "new-deployment", "", "", ""], prompts), log() {} });
  const saved = await readSavedSettings(root);
  assert.equal(saved.AZURE_OPENAI_DEPLOYMENT, "new-deployment");
  assert.equal(saved.AZURE_API_KEY, azure.AZURE_API_KEY);
  assert.doesNotMatch(JSON.stringify(prompts), /fake-only-key/);
});

test("cancellation after an invalid setting leaves saved configuration intact", async (t) => {
  const root = await fixture(t);
  await saveSettings(azure, root);
  const original = await readFile(join(root, ".env.local"), "utf8");
  const initial = ["azure", "update", "http://invalid"];
  await assert.rejects(configureSetup({ root, environment: {}, ask: async () => {
    if (initial.length) return initial.shift();
    throw new Error("cancelled");
  }, log() {} }), /cancelled/);
  await assert.rejects(configureSetup({ root, environment: {}, ask: async () => { throw new Error("cancelled"); }, log() {} }), /cancelled/);
  assert.equal(await readFile(join(root, ".env.local"), "utf8"), original);
});

test("actual host conflicts are named without leaking credentials", async (t) => {
  const root = await fixture(t);
  await saveSettings(azure, root);
  const logs = [];
  const config = await configureSetup({ root, environment: { WORKSHOP_PROVIDER: "chatgpt" }, ask: answers(["azure", "keep"]), log: (line) => logs.push(line) });
  assert.equal(config.provider, "chatgpt");
  assert.match(logs.join(), /overridden.*WORKSHOP_PROVIDER/);
  assert.doesNotMatch(logs.join(), /fake-only-key/);
});

test("hidden input never echoes key and restores terminal on success and cancellation", async () => {
  for (const cancel of [false, true]) {
    const input = new EventEmitter();
    input.isRaw = false;
    input.setRawMode = (value) => { input.isRaw = value; };
    input.resume = () => {};
    input.pause = () => {};
    let printed = "";
    const output = { write: (text) => { printed += text; } };
    const answer = hiddenQuestion(input, output, "Key: ");
    input.emit("keypress", "fake-only-key", {});
    input.emit("keypress", "", cancel ? { ctrl: true, name: "c" } : { name: "return" });
    if (cancel) await assert.rejects(answer, /cancelled/);
    else assert.equal(await answer, "fake-only-key");
    assert.equal(input.isRaw, false);
    assert.equal(input.listenerCount("keypress"), 0);
    assert.doesNotMatch(printed, /fake-only-key/);
  }
});

test("first ChatGPT setup needs one choice and persists for a fresh terminal", async (t) => {
  const fetch = t.mock.method(globalThis, "fetch", () => { throw new Error("unexpected request"); });
  const root = await fixture(t);
  const prompts = [];
  const config = await configureSetup({ root, environment: {}, ask: answers([""], prompts), log() {} });
  assert.equal(config.provider, "chatgpt");
  assert.equal(prompts.length, 1);
  assert.deepEqual(await readSavedSettings(root), { WORKSHOP_PROVIDER: "chatgpt" });
  assert.equal(readModelConfig(await loadLocalEnvironment({}, root)).provider, "chatgpt");
  assert.equal(fetch.mock.callCount(), 0);
});

test("development-local conflict remains authoritative and is reported", async (t) => {
  const root = await fixture(t);
  await saveSettings(azure, root);
  await writeFile(join(root, ".env.development.local"), "WORKSHOP_PROVIDER=azure\n");
  const logs = [];
  const config = await configureSetup({ root, environment: {}, ask: answers(["chatgpt"]), log: (line) => logs.push(line) });
  assert.equal(config.provider, "azure");
  assert.match(logs.join(), /overridden.*WORKSHOP_PROVIDER/);
  assert.doesNotMatch(logs.join(), /fake-only-key/);
});


test("invalid organizer defaults prompt for correction instead of being silently reused", async (t) => {
  const { WORKSHOP_PROVIDER, AZURE_API_KEY, ...defaults } = azure;
  const root = await fixture(t, {
    ...defaults,
    AZURE_OPENAI_ENDPOINT: "http://invalid",
    AZURE_OPENAI_CONTEXT_WINDOW: "abc",
    AZURE_OPENAI_API: "invalid",
  });
  const prompts = [], logs = [];
  const config = await configureSetup({ root, environment: {}, ask: answers([
    "azure", azure.AZURE_OPENAI_ENDPOINT, azure.AZURE_OPENAI_CONTEXT_WINDOW,
    azure.AZURE_OPENAI_API, azure.AZURE_API_KEY,
  ], prompts), log: (line) => logs.push(line) });
  assert.equal(config.provider, "azure");
  assert.equal(prompts.length, 5);
  assert.equal(prompts[1].fallback, "");
  assert.match(logs.join(), /AZURE_OPENAI_ENDPOINT.*invalid/);
  assert.deepEqual(await readSavedSettings(root), azure);
});

test("typed endpoint, context, and API errors retry the same field before asking for the key", async (t) => {
  const root = await fixture(t);
  const prompts = [], logs = [];
  await configureSetup({ root, environment: {}, ask: answers([
    "azure", "http://invalid", azure.AZURE_OPENAI_ENDPOINT,
    azure.AZURE_OPENAI_DEPLOYMENT, "abc", azure.AZURE_OPENAI_CONTEXT_WINDOW,
    "invalid", "chat", azure.AZURE_API_KEY,
  ], prompts), log: (line) => logs.push(line) });
  assert.equal(prompts[1].label, prompts[2].label);
  assert.equal(prompts[4].label, prompts[5].label);
  assert.equal(prompts[6].label, prompts[7].label);
  assert.equal(prompts.filter((prompt) => prompt.secret).length, 1);
  assert.match(logs.join(), /HTTPS/);
  assert.match(logs.join(), /positive integer/);
  assert.match(logs.join(), /responses or chat/);
  assert.doesNotMatch(logs.join(), /fake-only-key/);
  assert.equal((await readSavedSettings(root)).AZURE_OPENAI_API, "chat");
});
