import { defineTool } from "eve/tools";
import { z } from "zod";
import { serviceUnavailable } from "../../lib/service-unavailable.js";

export default defineTool({
  description:
    "Search files and folders the connected account can access using name text, MIME type, parent folder, ownership, and modified-time filters. Use this to locate a document or folder before opening or moving it. Results contain stable item IDs, names, item type, MIME type, parent IDs, modified time, owner, and a web-view link when available; file bytes are not included. A text query may match names or indexed content depending on provider support, while structured fields constrain results. Sort by relevance or modification time and use the page cursor to continue through a large result set. If a file is not found, broaden the query or search the parent folder before concluding it is unavailable. Searching is read-only and does not create, rename, move, or share items.",
  inputSchema: z.object({
    query: z
      .string()
      .optional()
      .describe("Name terms or provider-supported content search expression."),
    parentId: z
      .string()
      .optional()
      .describe(
        "Folder identifier used to restrict results to descendants or direct children.",
      ),
    mimeType: z
      .string()
      .optional()
      .describe("Exact MIME type or provider-supported type filter."),
    owner: z
      .string()
      .optional()
      .describe("Email address or account identifier of the file owner."),
    modifiedAfter: z
      .string()
      .optional()
      .describe(
        "Inclusive lower bound for modification time, in ISO 8601 form.",
      ),
    includeTrashed: z
      .boolean()
      .optional()
      .describe("Whether items in the trash should be considered."),
    sort: z
      .enum(["relevance", "modified_desc", "name_asc"])
      .optional()
      .describe("Ordering for matching items; relevance is the default."),
    pageSize: z
      .number()
      .int()
      .min(1)
      .max(100)
      .optional()
      .describe("Maximum item summaries to return on this page."),
    cursor: z
      .string()
      .optional()
      .describe(
        "Opaque continuation token returned by an earlier file search.",
      ),
  }),
  async execute() {
    return serviceUnavailable("files", "search_items");
  },
});
