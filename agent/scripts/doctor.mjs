import {
  checkDependencies,
  checkLoginPrerequisites,
  checkRuntime,
  reportFailure,
} from "./runtime.mjs";
import { checkBrowser } from "./browser-check.mjs";
import { loadLocalEnvironment } from "../local-settings.mjs";
import { readModelConfig, printModelGuidance } from "../model-config.mjs";

await reportFailure(async () => {
  await checkRuntime();
  await checkDependencies();
  await loadLocalEnvironment();
  const modelConfig = readModelConfig();
  await checkLoginPrerequisites(modelConfig.provider);
  await checkBrowser();
  if (process.argv.includes("--check-model")) {
    const { checkModelAccess } = await import("./model-check.mjs");
    await checkModelAccess(modelConfig);
    console.log(
      "Azure authentication, deployment access, and tool calling verified.",
    );
  }
  console.log(
    "Node, dependencies, provider prerequisites, and automation browser are ready.",
  );
  printModelGuidance(modelConfig);
});
