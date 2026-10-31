import { defineDynamic, defineTool } from "eve/tools";
import { isSkillLoaded } from "../../lib/skill-activation.js";
import { z } from "zod";
import { serviceUnavailable } from "../../lib/service-unavailable.js";

const registeredTool = defineTool({
  description: "Change slide order in a presentation while keeping each slide's content intact. Provide the stable deck ID and an ordered list of one-based slide numbers describing the desired sequence. Use a complete permutation when the service requires the full deck; include all current slides exactly once and check slide count with presentations-read_slides or search metadata first. An optional expected revision lets the service reject ordering based on a deck that has changed since inspection. The result returns the new sequence, revision, and any validation error details. If the list is rejected, reread current slide positions and prepare a corrected full ordering rather than guessing. This operation changes the deck order only. Use presentations-update_slide to edit content and presentations-add_slide to insert a new slide.",
  inputSchema: z.object({
    presentationId: z.string().min(1).describe('Stable ID of the deck whose sequence should change.'),
    orderedSlideNumbers: z.array(z.number().int().min(1)).min(1).max(500).describe('Desired one-based slide sequence; provide each existing slide once when a complete ordering is required.'),
    expectedRevision: z.string().optional().describe('Revision associated with the inspected ordering.'),
    preserveSectionGroups: z.boolean().optional().describe('Keep slides grouped under existing section boundaries when true, if supported.'),
    startAt: z.number().int().min(1).optional().describe('One-based destination position for a partial move when the service supports partial reordering.'),
    changeNote: z.string().max(500).optional().describe('Short reason for the reorder to include in revision history.'),
  }),
  async execute() {
    return serviceUnavailable("presentations", "reorder_slides");
  },
});

export default defineDynamic(() =>
  isSkillLoaded("presentations")
    ? { "presentations-reorder_slides": registeredTool }
    : null,
);
