import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import { browserEnvironment, launchEnvironment } from "../browser.mjs";

test("workshop browser selection overrides inherited browser connections and config", () => {
  const env = launchEnvironment("/workshop/chrome", {
    PATH: "/system/bin",
    AGENT_BROWSER_EXECUTABLE_PATH: "/other/chrome",
    AGENT_BROWSER_CONFIG: "/other/config.json",
    AGENT_BROWSER_PROVIDER: "remote",
    AGENT_BROWSER_CDP: "http://localhost:9222",
    AGENT_BROWSER_AUTO_CONNECT: "1",
    AGENT_BROWSER_NAMESPACE: "other-project",
    AGENT_BROWSER_ENGINE: "lightpanda",
    agent_browser_provider: "case-insensitive-remote",
  });
  assert.equal(env.PATH, "/system/bin");
  assert.equal(env.AGENT_BROWSER_EXECUTABLE_PATH, "/workshop/chrome");
  assert.equal(env.AGENT_BROWSER_ENGINE, "chrome");
  assert.ok(env.AGENT_BROWSER_CONFIG.endsWith("browser-config.json"));
  assert.match(env.AGENT_BROWSER_NAMESPACE, /^ws-[a-f0-9]{8}$/);
  for (const name of [
    "AGENT_BROWSER_PROVIDER",
    "AGENT_BROWSER_CDP",
    "AGENT_BROWSER_AUTO_CONNECT",
    "agent_browser_provider",
  ]) {
    assert.equal(env[name], undefined);
  }
});

test(
  "browser tools keep the pinned browser when sandbox environment conflicts",
  { timeout: 30_000 },
  async () => {
    const originalEnv = process.env;
    let hostAgentBrowser;
    try {
      process.env = {
        ...(await browserEnvironment()),
        AGENT_BROWSER_NAMESPACE: `wt-${randomUUID().slice(0, 8)}`,
      };
      ({ hostAgentBrowser } =
        await import("../../agent/lib/host-agent-browser.ts"));
    } finally {
      process.env = originalEnv;
    }
    const context = {
      env: new Map([
        ["AGENT_BROWSER_EXECUTABLE_PATH", "/missing/wrong-chrome"],
        ["AGENT_BROWSER_CONFIG", "/missing/wrong-config"],
        ["AGENT_BROWSER_ENGINE", "lightpanda"],
        ["AGENT_BROWSER_PROVIDER", "remote"],
        ["AGENT_BROWSER_CDP", "http://127.0.0.1:1"],
        ["AGENT_BROWSER_AUTO_CONNECT", "1"],
      ]),
      signal: new AbortController().signal,
    };
    const session = "check";
    try {
      const result = await hostAgentBrowser.execute(
        [
          "mcp",
          "call",
          "agent_browser_open",
          JSON.stringify({ url: "about:blank", session }),
        ],
        context,
      );
      assert.equal(result.exitCode, 0, result.stderr || result.stdout);
    } finally {
      const result = await hostAgentBrowser.execute(
        ["mcp", "call", "agent_browser_close", JSON.stringify({ session })],
        context,
      );
      assert.equal(result.exitCode, 0, result.stderr || result.stdout);
    }
  },
);
