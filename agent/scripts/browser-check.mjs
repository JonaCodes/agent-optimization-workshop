import { execFile } from "node:child_process";
import { randomUUID } from "node:crypto";
import { promisify } from "node:util";
import { agentRoot, browserCli, setupCommand } from "./runtime.mjs";
import {
  browserCandidates,
  isExecutable,
  launchEnvironment,
  missingBrowserError,
} from "./browser.mjs";

export async function checkBrowser({
  candidates,
  launch = launchBrowser,
} = {}) {
  const availableCandidates = candidates ?? (await browserCandidates());
  const failures = [];

  for (const candidate of availableCandidates) {
    const { executablePath, source } = candidate;
    if (!(await isExecutable(executablePath))) {
      failures.push(missingBrowserError(executablePath).message);
      continue;
    }

    const environment = launchEnvironment(executablePath);
    try {
      await launch(environment);
      if (source === "system stable") {
        console.log("Using installed stable Chrome for browser automation.");
      }
      return environment;
    } catch (error) {
      failures.push(
        `${source} Chrome at ${executablePath} could not launch: ${error.stderr?.trim() || error.message}`,
      );
    }
  }

  throw new Error(
    `Automation browser could not launch. Run: ${setupCommand}\n${failures.join("\n") || "No browser candidates were found."}`,
  );
}

async function launchBrowser(environment) {
  const namespace = `wc-${randomUUID().slice(0, 8)}`;
  const args = [browserCli, "--namespace", namespace, "--session", "check"];
  const options = {
    cwd: agentRoot,
    env: environment,
    timeout: 30_000,
    maxBuffer: 1024 * 1024,
  };
  const execute = promisify(execFile);
  try {
    await execute(process.execPath, [...args, "open", "about:blank"], options);
  } finally {
    // Close only this check's session; leave workshop/user sessions alone.
    await execute(process.execPath, [...args, "close"], {
      ...options,
      timeout: 10_000,
    }).catch(() => {});
  }
}
