import { execFile, spawn } from "node:child_process";
import { once } from "node:events";
import { resolve } from "node:path";
import { promisify } from "node:util";
import {
  agentRoot,
  workshopRoot,
  eveCli,
  checkDependencies,
  checkLoginPrerequisites,
  checkRuntime,
  reportFailure,
} from "./runtime.mjs";
import { checkBrowser } from "./browser-check.mjs";
import { browserEnvironment } from "./browser.mjs";
import { loadLocalEnvironment } from "../local-settings.mjs";
import { readModelConfig, printModelGuidance } from "../model-config.mjs";

const storeUrl = "http://127.0.0.1:4173";
let storeProcess;
let eveProcess;

process.on("exit", () => {
  eveProcess?.kill();
  storeProcess?.kill();
});
for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    if (eveProcess) eveProcess.kill(signal);
    else process.exit(signal === "SIGINT" ? 130 : 143);
  });
}

await reportFailure(async () => {
  await checkRuntime();
  await checkDependencies();
  await loadLocalEnvironment();
  const modelConfig = readModelConfig();
  // Keep Eve's selected provider consistent with this launcher's checks.
  process.env.WORKSHOP_PROVIDER = modelConfig.provider;
  await checkLoginPrerequisites(modelConfig.provider);
  await checkBrowser();
  printModelGuidance(modelConfig);

  try {
    if (!(await storeIsReady())) {
      storeProcess = spawn(
        process.execPath,
        [resolve(workshopRoot, "shopping-site/server.mjs")],
        {
          cwd: workshopRoot,
          stdio: ["ignore", "ignore", "inherit"],
        },
      );
      await waitForStore(storeProcess);
    }

    console.log(`Store ready at ${storeUrl}`);
    await openStore();

    eveProcess = spawn(
      process.execPath,
      [
        eveCli,
        "dev",
        "--assistant-response-stats",
        "tokens",
        ...process.argv.slice(2),
      ],
      { cwd: agentRoot, stdio: "inherit", env: await browserEnvironment() },
    );

    const [exitCode, signal] = await once(eveProcess, "exit");
    process.exitCode = exitCode ?? (signal === "SIGINT" ? 130 : 1);
  } finally {
    storeProcess?.kill();
  }
});

async function openStore() {
  const command =
    process.platform === "darwin"
      ? "open"
      : process.platform === "win32"
        ? "cmd.exe"
        : "xdg-open";
  const args =
    process.platform === "win32" ? ["/c", "start", "", storeUrl] : [storeUrl];
  try {
    await promisify(execFile)(command, args, { timeout: 5_000 });
  } catch {
    console.warn(`Open ${storeUrl} in your browser.`);
  }
}

async function storeIsReady() {
  try {
    const response = await fetch(`${storeUrl}/favorites`, {
      signal: AbortSignal.timeout(500),
    });
    return (
      response.ok && (await response.text()).includes("Good Basket Market")
    );
  } catch {
    return false;
  }
}

async function waitForStore(child) {
  const deadline = Date.now() + 5_000;

  while (Date.now() < deadline) {
    if (await storeIsReady()) return;
    if (child.exitCode !== null || child.signalCode !== null) {
      throw new Error(
        `Shopping site could not start at ${storeUrl}; check that port 4173 is free.`,
      );
    }
    await new Promise((resolveDelay) => setTimeout(resolveDelay, 50));
  }

  child.kill();
  throw new Error(`Shopping site did not start at ${storeUrl}.`);
}
