import { defineAgent } from "eve";
import { chatgpt } from "eve/models/openai";

export default defineAgent({
  build: { externalDependencies: ["agent-browser"] },
  model: chatgpt("gpt-6-luna-fast"),
  reasoning: "high",
});
