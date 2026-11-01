import { generateText, jsonSchema, ToolChoiceViolationError } from "ai";
import { createModelSelection } from "../model.mjs";

export async function checkModelAccess(config) {
  if (config.provider !== "azure") {
    throw new Error(
      "--check-model checks Azure OpenAI. For ChatGPT, sign in with /login in Eve and send a message.",
    );
  }
  let result;
  try {
    result = await generateText({
      model: createModelSelection(config).model,
      prompt: "Call workshop_check once. Do not write any text.",
      tools: {
        workshop_check: {
          description:
            "Confirm that tool calling works. This check has no side effects.",
          inputSchema: jsonSchema({
            type: "object",
            properties: {},
            required: [],
            additionalProperties: false,
          }),
        },
      },
      toolChoice: "required",
      maxOutputTokens: 2048,
      maxRetries: 0,
      abortSignal: AbortSignal.timeout(30_000),
    });
  } catch (error) {
    if (ToolChoiceViolationError.isInstance(error)) {
      throw new Error(
        "Azure responded without the requested tool call. Use a deployment that supports tool calling.",
      );
    }
    // Provider responses may contain credentials or endpoint details. Print only status.
    const status = Number.isInteger(error.statusCode)
      ? ` (HTTP ${error.statusCode})`
      : "";
    throw new Error(
      `Azure model check failed${status}. Check the key, endpoint, deployment, network access, and quota. The deployment must support tool calling with the selected AZURE_OPENAI_API (responses or chat).`,
    );
  }
  if (!result.toolCalls.some((call) => call.toolName === "workshop_check")) {
    throw new Error(
      "Azure responded without the requested tool call. Use a deployment that supports tool calling.",
    );
  }
}
