import { execFile } from "node:child_process";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

import type { JustBashCommand } from "eve/experimental/sandbox/just-bash";

const require = createRequire(import.meta.url);
const hostEnvironment = { ...process.env };
const nodeExecutable = process.execPath;
const browserCli = join(
  dirname(require.resolve("agent-browser/package.json")),
  "bin",
  "agent-browser.js",
);

export const hostAgentBrowser: JustBashCommand = {
  name: "agent-browser",
  trusted: false,
  async execute(args, context) {
    if (!isBrowserToolCall(args)) {
      return {
        exitCode: 2,
        stderr: "agent-browser is only available through the browser tools.\n",
        stdout: "",
      };
    }

    const executablePath = hostEnvironment.AGENT_BROWSER_EXECUTABLE_PATH;
    const config = hostEnvironment.AGENT_BROWSER_CONFIG;
    const namespace = hostEnvironment.AGENT_BROWSER_NAMESPACE;
    if (!executablePath || !config || !namespace) {
      return {
        exitCode: 1,
        stderr:
          "Start the workshop with npm --prefix agent run dev to use its pinned Chrome build.\n",
        stdout: "",
      };
    }

    return await new Promise((resolveResult) => {
      const browserEnv = Object.fromEntries(
        [...context.env].filter(([name]) => name.startsWith("AGENT_BROWSER_")),
      );
      const env: NodeJS.ProcessEnv = {
        ...hostEnvironment,
        ...browserEnv,
        AGENT_BROWSER_CONFIG: config,
        AGENT_BROWSER_EXECUTABLE_PATH: executablePath,
        AGENT_BROWSER_NAMESPACE: namespace,
        AGENT_BROWSER_ENGINE: "chrome",
      };
      delete env.AGENT_BROWSER_CDP;
      delete env.AGENT_BROWSER_AUTO_CONNECT;
      delete env.AGENT_BROWSER_PROVIDER;

      execFile(
        nodeExecutable,
        [
          browserCli,
          "--config",
          config,
          "--executable-path",
          executablePath,
          "--engine",
          "chrome",
          "--namespace",
          namespace,
          ...args,
        ],
        {
          encoding: "utf8",
          env,
          maxBuffer: 16 * 1024 * 1024,
          signal: context.signal,
        },
        (error, stdout, stderr) => {
          const code = error && "code" in error ? error.code : undefined;
          resolveResult({
            exitCode: typeof code === "number" ? code : error ? 1 : 0,
            stderr,
            stdout,
          });
        },
      );
    });
  },
};

function isBrowserToolCall(args: string[]) {
  return (
    args.length === 4 &&
    args[0] === "mcp" &&
    args[1] === "call" &&
    args[2]?.startsWith("agent_browser_")
  );
}
