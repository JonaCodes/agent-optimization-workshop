import assert from "node:assert/strict";
import test from "node:test";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { saveSettings, readSavedSettings } from "../../local-settings.mjs";
import { readModelConfig } from "../../model-config.mjs";
import { verifySetupModel } from "../setup-model.mjs";

const settings = {
  WORKSHOP_PROVIDER: "azure", AZURE_OPENAI_ENDPOINT: "https://example.openai.azure.com",
  AZURE_OPENAI_DEPLOYMENT: "test", AZURE_OPENAI_CONTEXT_WINDOW: "128000",
  AZURE_OPENAI_API: "responses", AZURE_API_KEY: "fake-key",
};
const config = readModelConfig(settings);
const rejection = (statusCode) => Object.assign(new Error("sanitized failure"), { statusCode });
async function fixture(t) {
  const root = await mkdtemp(join(tmpdir(), "setup-model-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await saveSettings(settings, root);
  return root;
}
test("setup checks Azure automatically and skips ChatGPT without a prompt", async () => {
  const calls = [];
  const options = { check: async (value) => calls.push(value), ask: () => assert.fail("unexpected prompt"), log() {} };
  await verifySetupModel(config, options);
  await verifySetupModel({ provider: "chatgpt" }, options);
  assert.deepEqual(calls, [config]);
});
test("401 permits one hidden key correction and checks the effective saved key", async (t) => {
  const root = await fixture(t);
  const calls = [], logs = [];
  const result = await verifySetupModel(config, { root, environment: {},
    check: async (value) => { calls.push(value); if (calls.length === 1) throw rejection(401); },
    ask: async (_label, options) => { assert.equal(options.secret, true); return "replacement-key"; },
    log: (line) => logs.push(line),
  });
  assert.equal(result.apiKey, "replacement-key");
  assert.equal(calls.length, 2);
  assert.equal((await readSavedSettings(root)).AZURE_API_KEY, "replacement-key");
  assert.doesNotMatch(logs.join(), /fake-key|replacement-key/);
});
for (const override of ["host", "development-local"]) {
  test(`401 identifies ${override} key override without ineffective replacement`, async (t) => {
    const root = await fixture(t);
    const environment = override === "host" ? { AZURE_API_KEY: "override-key" } : {};
    if (override !== "host") await writeFile(join(root, ".env.development.local"), "AZURE_API_KEY=override-key\n");
    await assert.rejects(verifySetupModel(config, { root, environment,
      check: async () => { throw rejection(401); }, ask: () => assert.fail("unexpected prompt"), log() {},
    }), /Correct AZURE_API_KEY.*override takes precedence/);
    assert.equal((await readSavedSettings(root)).AZURE_API_KEY, "fake-key");
  });
}
test("failed replacement stops after one correction attempt", async (t) => {
  const root = await fixture(t);
  let calls = 0, prompts = 0;
  await assert.rejects(verifySetupModel(config, { root, environment: {},
    check: async () => { calls++; throw rejection(401); },
    ask: async () => { prompts++; return "replacement-key"; }, log() {},
  }), /sanitized failure/);
  assert.equal(calls, 2);
  assert.equal(prompts, 1);
});
for (const status of [403, 429, undefined]) {
  test(`setup stops on ${status ?? "network/tool"} failure without requesting a key`, async (t) => {
    const root = await fixture(t);
    let calls = 0;
    await assert.rejects(verifySetupModel(config, { root, environment: {},
      check: async () => { calls++; throw rejection(status); },
      ask: () => assert.fail("unexpected prompt"), log() {},
    }), status === 403 ? /HTTP 403.*permissions/ : /sanitized failure/);
    assert.equal(calls, 1);
  });
}
