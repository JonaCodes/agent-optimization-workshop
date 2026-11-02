import { resolve } from "node:path";
import { checkBrowser } from "./browser-check.mjs";
import { agentRoot, runNode } from "./runtime.mjs";

export async function installAndCheckBrowser({
  install = () =>
    runNode(resolve(agentRoot, "scripts/install-browser.mjs"), []),
  check = checkBrowser,
  platform = process.platform,
  log = console.log,
  warn = console.warn,
} = {}) {
  log("Installing the automation browser (Linux may require sudo)…");
  let installError;
  try {
    await install();
  } catch (error) {
    installError = error;
    if (platform !== "win32") {
      throw new Error(
        `Browser installation failed. Check the error above, network access, and Linux sudo/system libraries, then rerun setup. ${error.message}`,
      );
    }
    warn(
      "Pinned Chrome installation failed; checking available Windows Chrome installations.",
    );
  }

  try {
    return await check();
  } catch (browserError) {
    if (!installError) throw browserError;
    throw new Error(
      `${browserError.message}\nPinned Chrome installation also failed: ${installError.message}`,
      { cause: browserError },
    );
  }
}
