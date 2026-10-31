import {
  agentRoot,
  checkDependencies,
  checkRuntime,
  reportFailure,
  runNode,
} from "./runtime.mjs";
import { resolve } from "node:path";
import { checkBrowser } from "./browser-check.mjs";

await reportFailure(async () => {
  await checkRuntime();
  if (!process.env.npm_execpath) {
    throw new Error(
      "Run setup from the repository root: npm --prefix agent run init-setup",
    );
  }
  console.log("Installing locked dependencies…");
  try {
    await runNode(process.env.npm_execpath, [
      "ci",
      "--include=dev",
      "--include=optional",
      "--ignore-scripts=false",
    ]);
  } catch (error) {
    throw new Error(
      `Dependency installation failed. Check the npm error above and network access to npm and GitHub, then rerun setup. ${error.message}`,
    );
  }
  await checkDependencies();
  console.log("Installing the automation browser (Linux may require sudo)…");
  try {
    await runNode(resolve(agentRoot, "scripts/install-browser.mjs"), []);
  } catch (error) {
    throw new Error(
      `Browser installation failed. Check the error above, network access, and Linux sudo/system libraries, then rerun setup. ${error.message}`,
    );
  }
  await checkBrowser();
  console.log("Setup complete. Run: npm --prefix agent run dev");
});
