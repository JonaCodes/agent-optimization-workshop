import { execFile } from "node:child_process";
import { randomUUID } from "node:crypto";
import { promisify } from "node:util";
import { agentRoot, browserCli, setupCommand } from "./runtime.mjs";
import { browserEnvironment } from "./browser.mjs";

export async function checkBrowser() {
  const namespace = `wc-${randomUUID().slice(0, 8)}`;
  const args = [browserCli, "--namespace", namespace, "--session", "check"];
  const env = await browserEnvironment();
  const options = {
    cwd: agentRoot,
    env,
    timeout: 30_000,
    maxBuffer: 1024 * 1024,
  };
  const execute = promisify(execFile);
  try {
    await execute(process.execPath, [...args, "open", "about:blank"], options);
  } catch (error) {
    throw new Error(
      `Automation browser could not launch. Run: ${setupCommand}\n${error.stderr?.trim() || error.message}`,
    );
  } finally {
    // Close only this check's session; leave workshop/user sessions alone.
    await execute(process.execPath, [...args, "close"], {
      ...options,
      timeout: 10_000,
    }).catch(() => {});
  }
}
