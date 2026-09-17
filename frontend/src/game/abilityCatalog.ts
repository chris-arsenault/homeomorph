import type { Action, Unit } from "./types";
import { core, selectable } from "../content/abilities";
export { core, selectable, isPassive } from "../content/abilities";
export type { Ability } from "../content/abilities";
import type { Ability } from "../content/abilities";

export function getAbility(unit: Unit, action: Action): Ability | undefined {
  if (action === "core1") return core[unit.template]?.[0];
  if (action === "core2") return core[unit.template]?.[1];
  const tier = ["skill1", "skill2", "skill3"].indexOf(action);
  return tier >= 0 ? selectable[unit.skills[tier]] : undefined;
}
