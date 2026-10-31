import { defineHook } from "eve/hooks";
import {
  activateSkillOnSuccess,
  recordSkillRequest,
  startSkillActivationTurn,
} from "../lib/skill-activation.js";

export default defineHook({
  events: {
    "turn.started"() {
      startSkillActivationTurn();
    },
    "call.requested"({ data }) {
      if (data.capability.kind === "skill") {
        recordSkillRequest(data.callId, data.capability.name);
      }
    },
    "call.settled"({ data }) {
      activateSkillOnSuccess(data.callId, data.outcome);
    },
  },
});
