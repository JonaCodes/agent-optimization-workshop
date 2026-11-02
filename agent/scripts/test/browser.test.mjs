import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import { browserCandidates, launchEnvironment } from "../browser.mjs";
import { checkBrowser } from "../browser-check.mjs";
import { installAndCheckBrowser } from "../setup-browser.mjs";

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

test("Windows candidates prefer the pinned browser then stable installed Chrome", async () => {
  const candidates = await browserCandidates({
    platform: "win32",
    getPinnedPath: async () => "C:\\workshop\\.browsers\\chrome.exe",
    getStablePath: async () =>
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  });
  assert.deepEqual(candidates, [
    {
      executablePath: "C:\\workshop\\.browsers\\chrome.exe",
      source: "pinned",
    },
    {
      executablePath:
        "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
      source: "system stable",
    },
  ]);
});

test("Windows candidate resolution keeps the pinned browser when stable Chrome is absent", async () => {
  const candidates = await browserCandidates({
    platform: "win32",
    getPinnedPath: async () => "C:\\workshop\\.browsers\\chrome.exe",
    getStablePath: async () => {
      throw new Error("Chrome stable is not installed");
    },
  });
  assert.deepEqual(candidates, [
    {
      executablePath: "C:\\workshop\\.browsers\\chrome.exe",
      source: "pinned",
    },
  ]);
});

test("macOS and Linux candidates do not resolve system Chrome", async () => {
  for (const platform of ["darwin", "linux"]) {
    let stableLookups = 0;
    const candidates = await browserCandidates({
      platform,
      getPinnedPath: async () => `/workshop/${platform}/chrome`,
      getStablePath: async () => {
        stableLookups += 1;
        return "/system/chrome";
      },
    });
    assert.deepEqual(candidates, [
      { executablePath: `/workshop/${platform}/chrome`, source: "pinned" },
    ]);
    assert.equal(stableLookups, 0);
  }
});

test("a missing pinned browser falls back to the next executable candidate", async () => {
  let launches = 0;
  const env = await checkBrowser({
    candidates: [
      { executablePath: "/missing/pinned/chrome", source: "pinned" },
      { executablePath: process.execPath, source: "system stable" },
    ],
    launch: async () => {
      launches += 1;
    },
  });
  assert.equal(launches, 1);
  assert.equal(env.AGENT_BROWSER_EXECUTABLE_PATH, process.execPath);
});

test("a failed pinned launch falls back to stable Chrome", async () => {
  const attempted = [];
  const env = await checkBrowser({
    candidates: [
      { executablePath: process.execPath, source: "pinned" },
      { executablePath: process.execPath, source: "system stable" },
    ],
    launch: async (environment) => {
      attempted.push(environment.AGENT_BROWSER_EXECUTABLE_PATH);
      if (attempted.length === 1) throw new Error("pinned launch failed");
    },
  });
  assert.deepEqual(attempted, [process.execPath, process.execPath]);
  assert.equal(env.AGENT_BROWSER_EXECUTABLE_PATH, process.execPath);
});

test("all browser candidates failing reports each launch error", async () => {
  await assert.rejects(
    checkBrowser({
      candidates: [
        { executablePath: process.execPath, source: "pinned" },
        { executablePath: process.execPath, source: "system stable" },
      ],
      launch: async (environment) => {
        throw new Error(
          `launch failed: ${environment.AGENT_BROWSER_EXECUTABLE_PATH}`,
        );
      },
    }),
    /pinned Chrome.*launch failed.*system stable Chrome.*launch failed/s,
  );
});

test("Windows setup checks installed browsers after pinned installation fails", async () => {
  const env = {
    AGENT_BROWSER_EXECUTABLE_PATH: "C:\\Program Files\\Chrome\\chrome.exe",
  };
  let checked = false;
  const result = await installAndCheckBrowser({
    platform: "win32",
    install: async () => {
      throw new Error("download failed");
    },
    check: async () => {
      checked = true;
      return env;
    },
    log: () => {},
    warn: () => {},
  });
  assert.equal(checked, true);
  assert.equal(result, env);
});

test("Windows setup reports both installation and launch failures", async () => {
  await assert.rejects(
    installAndCheckBrowser({
      platform: "win32",
      install: async () => {
        throw new Error("download failed");
      },
      check: async () => {
        throw new Error("no browser launched");
      },
      log: () => {},
      warn: () => {},
    }),
    /no browser launched[\s\S]*Pinned Chrome installation also failed: download failed/,
  );
});

test("non-Windows setup preserves pinned installation failure behavior", async () => {
  let checked = false;
  await assert.rejects(
    installAndCheckBrowser({
      platform: "darwin",
      install: async () => {
        throw new Error("download failed");
      },
      check: async () => {
        checked = true;
      },
      log: () => {},
    }),
    /Browser installation failed[\s\S]*download failed/,
  );
  assert.equal(checked, false);
});

test("browser namespaces change with the selected executable path", () => {
  const pinned = launchEnvironment("/workshop/chrome");
  const stable = launchEnvironment(
    "C:\\Program Files\\Google Chrome\\chrome.exe",
  );
  assert.equal(
    stable.AGENT_BROWSER_EXECUTABLE_PATH,
    "C:\\Program Files\\Google Chrome\\chrome.exe",
  );
  assert.notEqual(
    pinned.AGENT_BROWSER_NAMESPACE,
    stable.AGENT_BROWSER_NAMESPACE,
  );
});

test(
  "browser tools keep the selected browser when sandbox environment conflicts",
  { timeout: 30_000 },
  async () => {
    const originalEnv = process.env;
    let hostAgentBrowser;
    try {
      process.env = {
        ...(await checkBrowser()),
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
