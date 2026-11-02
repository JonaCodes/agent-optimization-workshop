import {
  checkDependencies,
  checkRuntime,
  reportFailure,
  runNode,
} from "./runtime.mjs";
import { installAndCheckBrowser } from "./setup-browser.mjs";
import { printModelGuidance } from "../model-config.mjs";

import { configureSetup } from "./setup-prompt.mjs";
import { verifySetupModel } from "./setup-model.mjs";

await reportFailure(async () => {
  await checkRuntime();
  const configured = await configureSetup();
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
  const modelConfig = await verifySetupModel(configured);
  await installAndCheckBrowser();
  printModelGuidance(modelConfig);
  console.log("Setup complete. Run: npm --prefix agent run dev");
});
