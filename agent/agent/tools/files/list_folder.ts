import { defineTool } from "eve/tools";
import { z } from "zod";
import { serviceUnavailable } from "../../lib/service-unavailable.js";

export default defineTool({
  description:
    "List the immediate children of a folder, returning one metadata summary per file or subfolder. Use this when the user names a folder or needs an inventory of its contents; for broad discovery across nested folders, use files-search_items instead. Each row includes an item ID, name, type, MIME type, size when applicable, modified time, and owner. Results can be filtered by item type or name prefix, then sorted by name or most recent modification. Pagination is bounded by the requested page size and the returned cursor must be used to retrieve later children. This listing is not recursive unless a depth option is supported by the service and explicitly requested. Listing does not download file contents or update the folder. Confirm you have all pages before reporting a complete inventory.",
  inputSchema: z.object({
    folderId: z
      .string()
      .describe(
        "Stable identifier of the folder whose direct children should be listed.",
      ),
    itemType: z
      .enum(["file", "folder", "either"])
      .optional()
      .describe("Restrict results to files, subfolders, or both."),
    namePrefix: z
      .string()
      .optional()
      .describe(
        "Optional case-insensitive name prefix used to filter children.",
      ),
    modifiedAfter: z
      .string()
      .optional()
      .describe("Inclusive lower bound for modified time, in ISO 8601 form."),
    sort: z
      .enum(["name_asc", "modified_desc"])
      .optional()
      .describe("Ordering for children; name is the default."),
    pageSize: z
      .number()
      .int()
      .min(1)
      .max(100)
      .optional()
      .describe("Maximum child summaries to return on this page."),
    cursor: z
      .string()
      .optional()
      .describe(
        "Opaque continuation token returned by a previous folder listing.",
      ),
    includeShared: z
      .boolean()
      .optional()
      .describe(
        "Whether to include shared items in addition to items owned by the account.",
      ),
  }),
  async execute() {
    return serviceUnavailable("files", "list_folder");
  },
});
