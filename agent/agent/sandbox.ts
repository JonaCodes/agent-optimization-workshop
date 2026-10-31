import { hostAgentBrowser } from "./lib/host-agent-browser.js";
import { defineSandbox } from "eve/sandbox";
import { JustBashSandbox } from "eve/sandbox/just-bash";

export const environment = JustBashSandbox.environment({
  autoInstall: false,
  experimental: {
    customCommands: [hostAgentBrowser],
  },
});

export default defineSandbox(() => environment.open());
