import browserExtension from "@agent-browser/eve";
import { defaultSessionName } from "@agent-browser/sandbox";
import { AgentBrowserCommandError, runAgentBrowser } from "@agent-browser/eve/sandbox";
import { browserBatchResponse } from "../../../lib/browser-batch-response.js";
import { defineDynamic, defineTool } from "eve/tools";
import { z } from "zod";
import { compactBrowserActionResultForModel } from "../../../lib/browser-model-output.js";
import { isSkillLoaded } from "../../../lib/skill-activation.js";

export { compactBrowserActionResultForModel } from "../../../lib/browser-model-output.js";

const selector = z
  .string()
  .trim()
  .min(1)
  .describe(
    'Element selector: a snapshot ref like "@e12", CSS selector, text=, or xpath= selector.',
  );

const waitAction = z.strictObject({
  action: z.literal("wait"),
  seconds: z
    .number()
    .int()
    .positive()
    .default(5)
    .describe(
      "Fixed settling delay in seconds. Omit for the default five seconds; set only when the task explicitly requires another duration.",
    ),
});

export const browserBatchActionSchema = z.discriminatedUnion("action", [
  z.strictObject({
    action: z.literal("fill"),
    clear: z
      .boolean()
      .default(true)
      .describe("Clear the field before entering text. Set false to append."),
    selector,
    text: z.string().describe("Text to enter."),
  }),
  z.strictObject({
    action: z.literal("upload"),
    files: z
      .array(z.string().trim().min(1))
      .min(1)
      .describe("Sandbox file paths to attach."),
    selector,
  }),
  z.strictObject({
    action: z.literal("press"),
    key: z.string().trim().min(1).describe("Key name or combination to press."),
  }),
  z.strictObject({
    action: z.literal("select"),
    selector,
    value: z.string().describe("Option value to select."),
  }),
  z.strictObject({
    action: z.literal("check"),
    checked: z.boolean(),
    selector,
  }),
  z.strictObject({
    action: z.literal("click"),
    selector,
  }),
  waitAction,
]);

export const browserBatchSchema = z.strictObject({
  actions: z
    .array(browserBatchActionSchema)
    .min(1)
    .describe("Ordered browser actions. The batch stops on its first failure."),
});

export type BrowserBatchAction = z.infer<typeof browserBatchActionSchema>;

export function browserBatchCommands(
  actions: readonly BrowserBatchAction[],
): string[][] {
  return actions.map(actionToCommand);
}

function actionToCommand(action: BrowserBatchAction): string[] {
  switch (action.action) {
    case "fill":
      return [action.clear ? "fill" : "type", action.selector, action.text];
    case "upload":
      return ["upload", action.selector, ...action.files];
    case "press":
      return ["press", action.key];
    case "select":
      return ["select", action.selector, action.value];
    case "check":
      return [action.checked ? "check" : "uncheck", action.selector];
    case "click":
      return ["click", action.selector];
    case "wait":
      return ["wait", String(action.seconds * 1000)];
  }
}

export const browserBatch = defineTool({
  description:
    "Run ordered browser actions in one Agent Browser session. After discovery, combine fills, uploads, key presses, selections, checks, ordinary clicks, and fixed waits without another model turn. For a fixed settling delay, omit wait seconds for the default five seconds and set seconds only when the user explicitly requests another duration. Stops on the first failure. Keep discovery, final verification, and consequential final actions outside the batch.",
  inputSchema: browserBatchSchema,
  label: {
    start: () => "Using browser",
  },
  async execute({ actions }, ctx) {
    const session =
      browserExtension.config.session ??
      defaultSessionName(browserExtension.config.sessionPrefix, "default");
    const result = await runAgentBrowser(
      ctx,
      [
        "mcp",
        "call",
        "agent_browser_batch",
        JSON.stringify({
          commands: browserBatchCommands(actions),
          bail: true,
          session,
        }),
      ],
      { abortSignal: ctx.abortSignal, json: false, session: "" },
    ).catch((error: unknown) => {
      if (!(error instanceof AgentBrowserCommandError)) throw error;
      // The SDK rejects nonzero exits before exposing parsed stdout.
      // Decode once; a failed batch may still contain completed actions.
      try {
        return { json: JSON.parse(error.stdout) as unknown };
      } catch {
        throw error;
      }
    });
    const response = browserBatchResponse(result.json);
    return {
      actionCount: actions.length,
      isError: response.isError,
      results: compactBrowserActionResultForModel(response.results),
    };
  },
});

export default defineDynamic(() =>
  isSkillLoaded("browser") || isSkillLoaded("grocery-shopping")
    ? { batch: browserBatch }
    : null,
);
