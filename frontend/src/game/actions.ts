import { encounters } from "../content/encounters";
import { getAbility, applyAbility } from "./abilities";
import {
  alive,
  clear,
  condition,
  distance,
  movement,
  pathTo,
  same,
  strike,
  unitAt,
  visible,
  updateTethers,
} from "./board";
import { checkOutcome, endActivation } from "./turns";
import type { Action, Battle, Command, Difficulty, Point, Transition, Unit } from "./types";

interface Context {
  battle: Battle;
  actor: Unit;
  target: Point;
  difficulty: Difficulty;
}
type Handler = (context: Context) => string;

function interactionTarget({ battle, actor, target, difficulty }: Context) {
  const objective = battle.objectives.find((entry) => same(entry.position, target));
  const range = actor.skills.includes("tarn-bypass") ? 2 : 1;
  if (!objective || distance(actor.position, target) > range)
    throw new Error(`Choose an objective within ${range} tile(s).`);
  if (objective.progress >= objective.needed) throw new Error("This objective is complete.");
  if (objective.optional && battle.round > 7 + difficulty.optionalRounds)
    throw new Error("This optional opportunity has closed.");
  requireObjectiveOrder(battle, objective.id, objective.optional);
  return objective;
}

function requireObjectiveOrder(battle: Battle, id: string, optional: boolean): void {
  if (![4, 5].includes(battle.mission) || optional) return;
  const first = battle.objectives.find((entry) => !entry.optional && entry.progress < entry.needed);
  if (first && first.id !== id) throw new Error(`Complete ${first.name} first.`);
}

function interact(context: Context): string {
  const { battle, actor } = context;
  const objective = interactionTarget(context);
  objective.progress += 1;
  battle.pressure = Math.max(0, battle.pressure - 1);
  actor.used.push("turn-interact");
  return `${objective.name}: ${objective.progress}/${objective.needed}.${objective.progress === objective.needed ? " Complete." : ""}`;
}

const handlers: Partial<Record<Action, Handler>> = {
  move: ({ battle, actor, target }) => {
    const range = movement(actor);
    if (!pathTo(battle, actor, target, range)?.length)
      throw new Error("No open route within movement range.");
    actor.position = target;
    actor.moved = true;
    return `${actor.name} moves to ${target.x},${target.y}.`;
  },
  strike: ({ battle, actor, target }) => {
    const defender = unitAt(battle, target);
    if (!defender || defender.side === actor.side) throw new Error("Choose a standing enemy.");
    if (distance(actor.position, target) > actor.range || !visible(battle, actor.position, target))
      throw new Error("Target is out of range or behind a wall.");
    actor.used.push("turn-strike");
    return strike(battle, actor, defender);
  },
  guard: ({ actor }) => {
    actor.guard = 1;
    if (actor.skills.includes("mara-holdfast")) condition(actor, "braced");
    return `${actor.name} gains Guard until the next activation. Guard does not stack.`;
  },
  assist: ({ battle, actor, target }) => {
    const ally = unitAt(battle, target);
    if (!ally || ally.side !== actor.side || distance(actor.position, target) > 1)
      throw new Error("Choose an adjacent standing ally.");
    const healing = actor.skills.includes("sela-field-care") ? 2 : 1;
    ally.vitality = Math.min(ally.maximumVitality, ally.vitality + healing);
    clear(ally, "restrained");
    return `${ally.name} recovers up to ${healing} vitality and clears Restrained.`;
  },
  interact,
};

export function actionCost(unit: Unit, action: Action): number {
  if (
    action === "interact" &&
    unit.skills.includes("nera-chain-of-custody") &&
    !unit.used.includes("turn-interact")
  )
    return 0;
  return getAbility(unit, action)?.cost ?? 1;
}

function act(battle: Battle, action: Action, target: Point, difficulty: Difficulty): string {
  const actor = battle.units.find((unit) => unit.id === battle.activeId);
  if (!actor || !alive(actor)) throw new Error("Choose a ready crew member.");
  const cost = actionCost(actor, action);
  if (battle.ap < cost) throw new Error("Not enough action points. End activation or rewind.");
  const handler = handlers[action];
  const item = getAbility(actor, action);
  if (!handler && !item) throw new Error("This action is not available.");
  const message = handler
    ? handler({ battle, actor, target, difficulty })
    : applyAbility(battle, actor, target, item!);
  battle.ap -= cost;
  battle.log.push(message);
  checkOutcome(battle);
  return message;
}

function select(battle: Battle, unitId: string): string {
  if (battle.activeId) throw new Error("Finish the current activation first.");
  const actor = battle.units.find((unit) => unit.id === unitId);
  if (!actor || actor.side !== "crew" || !actor.ready || !alive(actor))
    throw new Error("Choose a ready crew member.");
  battle.activeId = unitId;
  battle.ap = 2;
  actor.guard = 0;
  actor.moved = false;
  clear(actor, "braced");
  actor.used = actor.used.filter((entry) => !entry.startsWith("turn-"));
  return `${actor.name}: 2 action points.`;
}

export function transition(source: Battle, command: Command, difficulty: Difficulty): Transition {
  if (source.outcome !== "playing")
    return { state: source, legal: false, message: "This mission has ended." };
  const state = structuredClone(source);
  try {
    let message: string;
    if (command.type === "select") message = select(state, command.unitId);
    else if (command.type === "end") {
      endActivation(state, difficulty);
      message = state.log.slice(source.log.length).join(" ");
    } else message = act(state, command.action, command.target, difficulty);
    updateTethers(state);
    state.log = state.log.slice(-60);
    return { state, legal: true, message };
  } catch (error) {
    return {
      state: source,
      legal: false,
      message: error instanceof Error ? error.message : "Invalid action.",
    };
  }
}

export function objectiveSummary(battle: Battle): string {
  if (battle.outcome === "lost")
    return battle.pressure >= 8
      ? "The stabilization lock reached full pressure."
      : "The crew or mission deadline could not hold.";
  if (battle.outcome === "won") return encounters[battle.mission].resolution;
  return "Complete the required objectives. Fighting is optional; incapacitation is reversible.";
}
