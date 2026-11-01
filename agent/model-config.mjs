/**
 * @typedef {{ provider: "chatgpt" } | {
 *   provider: "azure", baseURL: string, deployment: string, apiKey: string,
 *   api: "responses" | "chat", contextWindow: number
 * }} ModelConfig
 */

/** @param {NodeJS.ProcessEnv} [environment] @returns {ModelConfig} */
export function readModelConfig(environment = process.env) {
  const provider = environment.WORKSHOP_PROVIDER?.trim() || "chatgpt";
  if (provider === "chatgpt") return { provider };
  if (provider !== "azure") {
    throw new Error("Set WORKSHOP_PROVIDER to chatgpt or azure.");
  }

  const required = [
    "AZURE_OPENAI_ENDPOINT",
    "AZURE_OPENAI_DEPLOYMENT",
    "AZURE_API_KEY",
    "AZURE_OPENAI_CONTEXT_WINDOW",
  ];
  const missing = required.filter((name) => !environment[name]?.trim());
  if (missing.length) {
    throw new Error(
      `Azure configuration is incomplete. Set ${missing.join(", ")} by running npm --prefix agent run init-setup.`,
    );
  }

  for (const key of [...required, "AZURE_OPENAI_API"]) {
    validateAzureSetting(
      key,
      environment[key] || (key === "AZURE_OPENAI_API" ? "responses" : ""),
    );
  }
  const endpoint = new URL(environment.AZURE_OPENAI_ENDPOINT.trim());
  const api = environment.AZURE_OPENAI_API?.trim() || "responses";
  const contextWindow = Number(environment.AZURE_OPENAI_CONTEXT_WINDOW);

  return {
    provider,
    baseURL: `${endpoint.origin}/openai/v1`,
    deployment: environment.AZURE_OPENAI_DEPLOYMENT.trim(),
    apiKey: environment.AZURE_API_KEY.trim(),
    api,
    contextWindow,
  };
}

/** Validate one setting without including its value in errors. */
export function validateAzureSetting(key, value) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Set ${key} to a nonempty value.`);
  }
  if (key === "AZURE_OPENAI_ENDPOINT") {
    let endpoint;
    try {
      endpoint = new URL(value.trim());
    } catch {
      throw new Error(
        "AZURE_OPENAI_ENDPOINT must be an HTTPS Azure OpenAI URL.",
      );
    }
    if (
      endpoint.protocol !== "https:" ||
      endpoint.username ||
      endpoint.password ||
      endpoint.search ||
      endpoint.hash
    ) {
      throw new Error(
        "AZURE_OPENAI_ENDPOINT must use HTTPS without credentials, query parameters, or a fragment.",
      );
    }
    const path = endpoint.pathname.replace(/\/+$/, "");
    if (!["", "/openai", "/openai/v1"].includes(path)) {
      throw new Error(
        "Use the Azure OpenAI resource endpoint, optionally ending in /openai/v1, for AZURE_OPENAI_ENDPOINT.",
      );
    }
  }
  if (
    key === "AZURE_OPENAI_API" &&
    !["responses", "chat"].includes(value.trim())
  ) {
    throw new Error("Set AZURE_OPENAI_API to responses or chat.");
  }
  if (key === "AZURE_OPENAI_CONTEXT_WINDOW") {
    const contextWindow = Number(value);
    if (
      !/^\d+$/.test(value.trim()) ||
      !Number.isSafeInteger(contextWindow) ||
      contextWindow <= 0
    ) {
      throw new Error(
        "Set AZURE_OPENAI_CONTEXT_WINDOW to the deployment's token context limit as a positive integer.",
      );
    }
  }
}

/** @param {ModelConfig} config */
export function printModelGuidance(config) {
  if (config.provider === "chatgpt") {
    console.log(
      "Model: ChatGPT subscription. In Eve, run /login and choose ChatGPT Subscription.",
    );
    console.log("To change provider, rerun npm --prefix agent run init-setup.");
  } else {
    console.log(
      `Model: Azure OpenAI (${config.api} API). Local configuration is complete.`,
    );
  }
}
