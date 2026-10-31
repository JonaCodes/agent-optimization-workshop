import { defineState } from "eve/context";

const skillActivation = defineState<{
  loadedSkills: string[];
  pendingSkillLoads: Record<string, string>;
}>("workshop.skill-activation", () => ({
  loadedSkills: [],
  pendingSkillLoads: {},
}));

export function isSkillLoaded(skillName: string): boolean {
  return skillActivation.get().loadedSkills.includes(skillName);
}

export function startSkillActivationTurn(): void {
  skillActivation.update((current) => ({ ...current, pendingSkillLoads: {} }));
}

export function recordSkillRequest(callId: string, skillName: string): void {
  skillActivation.update((current) => ({
    ...current,
    pendingSkillLoads: { ...current.pendingSkillLoads, [callId]: skillName },
  }));
}

export function activateSkillOnSuccess(callId: string, outcome: string): void {
  const current = skillActivation.get();
  const skillName = current.pendingSkillLoads[callId];
  if (skillName === undefined) return;

  skillActivation.update((state) => {
    const pendingSkillLoads = { ...state.pendingSkillLoads };
    delete pendingSkillLoads[callId];
    return {
      loadedSkills:
        outcome === "completed" && !state.loadedSkills.includes(skillName)
          ? [...state.loadedSkills, skillName]
          : state.loadedSkills,
      pendingSkillLoads,
    };
  });
}
