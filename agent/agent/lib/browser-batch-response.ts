export function browserBatchResponse(value: unknown): { results: unknown; isError: boolean } {
  if (value === null || typeof value !== "object") {
    throw new Error("agent-browser batch returned an invalid MCP response.");
  }

  // Native v0.41 MCP wraps the complete CLI batch array here, including
  // completed actions and the failing action when bail stops execution.
  if ("structuredContent" in value) {
    const structured = value.structuredContent;
    if (
      structured !== null &&
      typeof structured === "object" &&
      "response" in structured &&
      structured.response !== null &&
      structured.response !== undefined
    ) {
      return {
        results: structured.response,
        isError: "isError" in value && value.isError === true,
      };
    }
  }

  throw new Error(
    `agent-browser batch returned no action results: ${JSON.stringify(value)}`,
  );
}
