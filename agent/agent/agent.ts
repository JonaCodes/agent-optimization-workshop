import { defineAgent } from "eve";
import { readModelConfig } from "../model-config.mjs";
import { createModelSelection } from "../model.mjs";

export default defineAgent({
  build: { externalDependencies: ["agent-browser"] },
  ...createModelSelection(readModelConfig()),
});
