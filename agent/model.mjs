import { createAzure } from "@ai-sdk/azure";
import { chatgpt } from "eve/models/openai";

/** @param {import("./model-config.mjs").ModelConfig} config */
export function createModelSelection(config) {
  if (config.provider === "chatgpt") {
    return {
      model: chatgpt("gpt-6-luna-fast"),
      reasoning: /** @type {"high"} */ ("high"),
    };
  }
  const azure = createAzure({ baseURL: config.baseURL, apiKey: config.apiKey });
  return {
    modelContextWindowTokens: config.contextWindow,
    model:
      config.api === "chat"
        ? azure.chat(config.deployment)
        : azure(config.deployment),
  };
}
