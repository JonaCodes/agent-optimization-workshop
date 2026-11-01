import assert from "node:assert/strict";
import test from "node:test";
import { readModelConfig, printModelGuidance } from "../../model-config.mjs";
import { createModelSelection } from "../../model.mjs";
import { checkModelAccess } from "../model-check.mjs";

const azureEnvironment = {
  WORKSHOP_PROVIDER: "azure",
  AZURE_OPENAI_ENDPOINT: "https://workshop.openai.azure.com/",
  AZURE_OPENAI_DEPLOYMENT: "workshop-deployment",
  AZURE_API_KEY: "test-only-secret",
  AZURE_OPENAI_CONTEXT_WINDOW: "128000",
};

test("ChatGPT stays the default even when Azure credentials are present", () => {
  const { WORKSHOP_PROVIDER, ...environment } = azureEnvironment;
  const config = readModelConfig(environment);
  assert.equal(config.provider, "chatgpt");
  const selection = createModelSelection(config);
  assert.equal(selection.model.modelId, "gpt-6-luna-fast");
  assert.equal(selection.reasoning, "high");
  assert.equal(
    readModelConfig({ WORKSHOP_PROVIDER: "chatgpt" }).provider,
    "chatgpt",
  );
});

test("Azure reports all missing settings without exposing credentials", () => {
  assert.throws(
    () =>
      readModelConfig({
        WORKSHOP_PROVIDER: "azure",
        AZURE_API_KEY: "test-only-secret",
      }),
    (error) => {
      assert.match(
        error.message,
        /AZURE_OPENAI_ENDPOINT.*AZURE_OPENAI_DEPLOYMENT/,
      );
      assert.doesNotMatch(error.message, /test-only-secret/);
      return true;
    },
  );
  assert.throws(
    () => readModelConfig({ WORKSHOP_PROVIDER: "unknown" }),
    /chatgpt or azure/,
  );
  assert.throws(
    () => readModelConfig({ ...azureEnvironment, AZURE_OPENAI_API: "unknown" }),
    /responses or chat/,
  );
});

test("Azure accepts portal resource and OpenAI v1 endpoints without duplicating paths", () => {
  for (const path of [
    "",
    "/",
    "/openai",
    "/openai/",
    "/openai/v1",
    "/openai/v1/",
  ]) {
    const config = readModelConfig({
      ...azureEnvironment,
      AZURE_OPENAI_ENDPOINT: `https://workshop.openai.azure.com${path}`,
    });
    assert.equal(config.baseURL, "https://workshop.openai.azure.com/openai/v1");
    assert.equal(config.deployment, "workshop-deployment");
    assert.equal(config.api, "responses");
    assert.equal(createModelSelection(config).modelContextWindowTokens, 128000);
    assert.equal(createModelSelection(config).reasoning, undefined);
  }
});

test("Azure requires a valid deployment context limit", () => {
  for (const limit of [
    "",
    "0",
    "-1",
    "1.5",
    "1e5",
    "128,000",
    "9007199254740992",
  ]) {
    assert.throws(
      () =>
        readModelConfig({
          ...azureEnvironment,
          AZURE_OPENAI_CONTEXT_WINDOW: limit,
        }),
      /AZURE_OPENAI_CONTEXT_WINDOW/,
    );
  }
});

test("Azure endpoint errors hide URL secrets and reject project/API-specific paths", () => {
  for (const endpoint of [
    "invalid-test-only-secret",
    "http://workshop.openai.azure.com",
    "https://test-only-secret@workshop.openai.azure.com",
    "https://workshop.openai.azure.com?api-key=test-only-secret",
    "https://workshop.openai.azure.com#test-only-secret",
    "https://workshop.services.ai.azure.com/api/projects/test-project",
    "https://workshop.openai.azure.com/openai/v1/responses",
  ]) {
    assert.throws(
      () =>
        readModelConfig({
          ...azureEnvironment,
          AZURE_OPENAI_ENDPOINT: endpoint,
        }),
      (error) => {
        assert.match(error.message, /AZURE_OPENAI_ENDPOINT/);
        assert.doesNotMatch(error.message, /test-only-secret/);
        return true;
      },
    );
  }
});

function modelResponse(api, withTool = true) {
  if (api === "responses") {
    return {
      id: "resp_check",
      object: "response",
      created_at: 1,
      model: "workshop-deployment",
      status: "completed",
      output: withTool
        ? [
            {
              id: "fc_check",
              type: "function_call",
              call_id: "call_check",
              name: "workshop_check",
              arguments: "{}",
              status: "completed",
            },
          ]
        : [
            {
              id: "msg_check",
              type: "message",
              role: "assistant",
              status: "completed",
              content: [
                { type: "output_text", text: "Ready", annotations: [] },
              ],
            },
          ],
      usage: { input_tokens: 8, output_tokens: 4, total_tokens: 12 },
    };
  }
  return {
    id: "chatcmpl_check",
    object: "chat.completion",
    created: 1,
    model: "workshop-deployment",
    choices: [
      {
        index: 0,
        finish_reason: withTool ? "tool_calls" : "stop",
        message: {
          role: "assistant",
          content: null,
          ...(withTool
            ? {
                tool_calls: [
                  {
                    id: "call_check",
                    type: "function",
                    function: { name: "workshop_check", arguments: "{}" },
                  },
                ],
              }
            : {}),
        },
      },
    ],
    usage: { prompt_tokens: 8, completion_tokens: 4, total_tokens: 12 },
  };
}

for (const api of ["responses", "chat"]) {
  test(`Azure ${api} check uses the selected endpoint, deployment, key, and tool protocol`, async (t) => {
    const requests = [];
    t.mock.method(globalThis, "fetch", async (url, init) => {
      requests.push({ url: String(url), init });
      return Response.json(modelResponse(api));
    });
    await checkModelAccess(
      readModelConfig({ ...azureEnvironment, AZURE_OPENAI_API: api }),
    );
    assert.equal(requests.length, 1);
    const { url, init } = requests[0];
    const expectedPath = api === "chat" ? "chat/completions" : "responses";
    assert.equal(
      url,
      `https://workshop.openai.azure.com/openai/v1/${expectedPath}`,
    );
    assert.equal(new Headers(init.headers).get("api-key"), "test-only-secret");
    const body = JSON.parse(init.body);
    assert.equal(body.model, "workshop-deployment");
    assert.equal(body.tool_choice, "required");
    assert.equal(body.tools.length, 1);
    assert.equal(body.reasoning_effort, undefined);
  });
}

test("Azure check sanitizes provider failures and does not retry a rejected request", async (t) => {
  let requests = 0;
  t.mock.method(globalThis, "fetch", async () => {
    requests++;
    return Response.json(
      { error: { message: "test-only-secret", code: "Unauthorized" } },
      { status: 401 },
    );
  });
  await assert.rejects(
    checkModelAccess(readModelConfig(azureEnvironment)),
    (error) => {
      assert.match(error.message, /HTTP 401/);
      assert.doesNotMatch(error.message, /test-only-secret/);
      return true;
    },
  );
  assert.equal(requests, 1);
});

test("Azure check requires a tool call, not just a successful HTTP response", async (t) => {
  t.mock.method(globalThis, "fetch", async () =>
    Response.json(modelResponse("responses", false)),
  );
  await assert.rejects(
    checkModelAccess(readModelConfig(azureEnvironment)),
    /without the requested tool call/,
  );
});

test("ChatGPT check gives login guidance without making an API request", async (t) => {
  const fetch = t.mock.method(globalThis, "fetch", () => {
    throw new Error("unexpected request");
  });
  await assert.rejects(
    checkModelAccess({ provider: "chatgpt" }),
    /sign in with \/login/,
  );
  assert.equal(fetch.mock.callCount(), 0);
});

test("setup guidance never prints the Azure key or endpoint", (t) => {
  const messages = [];
  t.mock.method(console, "log", (message) => messages.push(message));
  printModelGuidance(readModelConfig(azureEnvironment));
  assert.ok(messages.length > 0);
  assert.doesNotMatch(messages.join("\n"), /test-only-secret|workshop\.openai/);
});
