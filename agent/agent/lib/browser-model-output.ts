import { screenshot } from "@agent-browser/eve/tools";
import type { ToolModelOutput } from "eve/tools";

export function browserActionModelOutput(output: unknown): ToolModelOutput {
  return typeof output === "string"
    ? { type: "text", value: output }
    : { type: "json", value: compactBrowserActionResultForModel(output ?? null) };
}

export function browserSnapshotModelOutput(output: unknown): ToolModelOutput {
  if (
    output !== null &&
    typeof output === "object" &&
    !Array.isArray(output) &&
    "snapshot" in output &&
    typeof output.snapshot === "string" &&
    !("revision" in output) &&
    !("error" in output) &&
    !("errors" in output) &&
    !("diagnostics" in output) &&
    !("isError" in output && output.isError === true) &&
    !("success" in output && output.success === false)
  ) {
    return {
      type: "json",
      value: {
        origin: "origin" in output ? output.origin : undefined,
        snapshot: output.snapshot,
      },
    };
  }
  // Delta revisions, ref patches, and failures retain their complete protocol.
  return browserActionModelOutput(output);
}

export async function browserScreenshotModelOutput(
  output: Parameters<NonNullable<typeof screenshot.toModelOutput>>[0],
): Promise<ToolModelOutput> {
  const modelOutput = screenshot.toModelOutput === undefined
    ? browserActionModelOutput(output)
    : await screenshot.toModelOutput(output);
  return modelOutput.type === "json"
    ? { ...modelOutput, value: compactBrowserActionResultForModel(modelOutput.value) }
    : modelOutput;
}

export function compactBrowserActionResultForModel(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(compactBrowserActionResultForModel);
  if (value === null || typeof value !== "object") return value;

  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => key !== "lifecycle")
      .map(([key, nested]) => [key, compactBrowserActionResultForModel(nested)]),
  );
}
