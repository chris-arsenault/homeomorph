import type { Battle, Point, Unit } from "./types";
import {
  alive,
  clear,
  condition,
  distance,
  open,
  pathTo,
  setTile,
  strike,
  tileAt,
  unitAt,
  visible,
} from "./board";
import { isPassive, type Ability } from "./abilityCatalog";
export { core, selectable, getAbility, isPassive } from "./abilityCatalog";
export type { Ability } from "./abilityCatalog";

interface Context {
  battle: Battle;
  actor: Unit;
  point: Point;
  target: Unit | null;
  item: Ability;
}
type Effect = (context: Context) => string;
function requireTarget(context: Context, side: "ally" | "enemy", range: number): Unit {
  const { actor, target, battle } = context;
  if (!target || !alive(target)) throw new Error("Choose a standing unit.");
  if ((target.side === actor.side) !== (side === "ally")) throw new Error(`Choose an ${side}.`);
  if (
    distance(actor.position, target.position) > range ||
    !visible(battle, actor.position, target.position)
  )
    throw new Error("Target is out of reach or behind a wall.");
  return target;
}

function once(actor: Unit, id: string): void {
  if (actor.used.includes(id)) throw new Error("Already used this mission.");
  actor.used.push(id);
}

function travel({ battle, actor, point, item }: Context): string {
  let range = item.id === "traverse" ? 7 : 5;
  if (actor.conditions.includes("restrained")) range = 1;
  if (item.id === "gone") {
    if (!actor.used.includes("turn-strike") || actor.used.includes("turn-gone"))
      throw new Error("Strike first; use once per activation.");
    actor.used.push("turn-gone");
  }
  if (!pathTo(battle, actor, point, range)?.length)
    throw new Error("Choose a reachable empty tile.");
  actor.position = point;
  actor.moved = true;
  return `${actor.name} moves to ${point.x}, ${point.y}.`;
}

function surrenderEligible(battle: Battle, target: Unit, threshold: number): boolean {
  return (
    target.kind === "human" &&
    target.vitality <= threshold &&
    !battle.units.some(
      (unit) =>
        unit.id !== target.id &&
        unit.side === target.side &&
        alive(unit) &&
        distance(unit.position, target.position) <= 2
    )
  );
}

const effects: Record<string, Effect> = {
  brace: ({ battle, actor, point }) => {
    if (distance(actor.position, point) > 1 || !open(battle, point, actor.id))
      throw new Error("Choose an open adjacent tile.");
    setTile(battle, point, "c");
    if (actor.skills.includes("tarn-good-brace")) actor.guard = 1;
    return "Temporary cover placed: incoming damage reduced by 1.";
  },
  steady: (context) => {
    requireTarget(context, "ally", 1).guard = 1;
    return "Ally gains Guard.";
  },
  mark: (context) => {
    condition(requireTarget(context, "enemy", 5), "marked");
    return "Marked: next strike gains 1 power.";
  },
  traverse: travel,
  gone: travel,
  treat: (context) => {
    const target = requireTarget(context, "ally", 1);
    target.vitality = Math.min(target.maximumVitality, target.vitality + 1);
    clear(target, "marked");
    return `${target.name} recovers 1 vitality and clears Marked.`;
  },
  surrender: (context) => {
    const target = requireTarget(context, "enemy", 3);
    const threshold = context.actor.skills.includes("sela-terms-spoken") ? 3 : 2;
    if (!surrenderEligible(context.battle, target, threshold))
      throw new Error(
        `Requires a human at ${threshold} vitality or less with no ally within 2 tiles.`
      );
    target.surrendered = true;
    return `${target.name} surrenders. They remain safe on the board.`;
  },
  tool: (context) => {
    const target = requireTarget(context, "enemy", 1);
    let bonus = target.kind === "human" ? 2 : 3;
    if (target.kind !== "human" && context.actor.skills.includes("tarn-shear-pin")) bonus += 2;
    return strike(context.battle, context.actor, target, bonus);
  },
  interpose: (context) => {
    const target = requireTarget(context, "enemy", 6);
    const intent = context.battle.intents.find((entry) => entry.unitId === target.id);
    if (!intent || distance(intent.destination, context.actor.position) > target.range)
      throw new Error("This enemy cannot legally target you from its declared destination.");
    intent.targetId = context.actor.id;
    intent.action = "strike";
    return `${target.name}'s intent now targets ${context.actor.name}.`;
  },
  codes: (context) => {
    const objective = context.battle.objectives.find(
      (entry) => distance(entry.position, context.point) === 0
    );
    if (
      objective &&
      [6, 8].includes(context.battle.mission) &&
      distance(context.actor.position, context.point) <= 1
    ) {
      if (objective.progress >= objective.needed)
        throw new Error("This device is already repaired or disabled.");
      objective.progress = Math.min(objective.needed, objective.progress + 1);
      context.battle.pressure = Math.max(0, context.battle.pressure - 1);
      return `${objective.name}: +1 progress.`;
    }
    const target = requireTarget(context, "enemy", 1);
    if (target.kind !== "drone")
      throw new Error("Choose an adjacent drone or a relay in the stabilizer or finale mission.");
    target.vitality = 0;
    return "Device safely disabled.";
  },
  order: (context) => {
    const target = requireTarget(context, "ally", 1);
    const objective = context.battle.objectives.find((entry) => entry.progress < entry.needed);
    if (!objective || target.id === context.actor.id)
      throw new Error("Choose another ally while an objective remains.");
    const candidates = context.battle.tiles
      .flatMap((row, y) => [...row].map((_, x) => ({ x, y })))
      .filter((point) => pathTo(context.battle, target, point, 2)?.length)
      .sort((a, b) => distance(a, objective.position) - distance(b, objective.position));
    if (!candidates[0]) throw new Error("No route is available.");
    target.position = candidates[0];
    target.moved = true;
    return `${target.name} moves to ${target.position.x}, ${target.position.y}.`;
  },
  rally: ({ battle, actor }) => {
    battle.units
      .filter((unit) => unit.side === actor.side && distance(unit.position, actor.position) <= 2)
      .forEach((unit) => {
        unit.guard = 1;
        clear(unit, "restrained");
      });
    return "Nearby allies gain Guard and clear Restrained.";
  },
  ready: (context) => {
    const target = requireTarget(context, "ally", 1);
    if (target.ready || target.id === context.actor.id)
      throw new Error("Choose another ally who has already acted.");
    once(context.actor, "ready");
    target.ready = true;
    return `${target.name} is ready again.`;
  },
  slip: ({ battle, actor, point }) => {
    if (
      actor.conditions.includes("restrained") ||
      distance(actor.position, point) > 3 ||
      !open(battle, point)
    )
      throw new Error("Choose an empty tile within 3; clear restraint first.");
    actor.position = point;
    actor.moved = true;
    return "Iven crosses the closed route.";
  },
  gate: ({ battle, actor, point }) => {
    const range = actor.template === "iven" ? 3 : 1;
    if (
      distance(actor.position, point) > range ||
      tileAt(battle, point) !== "#" ||
      point.x < 1 ||
      point.x > 10 ||
      point.y < 1 ||
      point.y > 7
    )
      throw new Error("Choose an internal wall in range.");
    once(actor, "gate");
    setTile(battle, point, ".");
    return "A new passage opens for this mission.";
  },
  revive: ({ battle, actor, point }) => {
    const target = battle.units.find(
      (unit) =>
        unit.side === actor.side && unit.vitality === 0 && distance(unit.position, point) === 0
    );
    if (!target || distance(actor.position, point) > 1 || unitAt(battle, point))
      throw new Error("Choose an adjacent fallen ally on an unoccupied tile.");
    once(actor, "revive");
    target.vitality = 2;
    target.ready = true;
    target.conditions = [];
    return `${target.name} returns with 2 vitality.`;
  },
  cleanse: ({ battle, actor }) => {
    battle.units
      .filter((unit) => unit.side === actor.side && distance(unit.position, actor.position) <= 2)
      .forEach((unit) => {
        unit.conditions = [];
      });
    return "All nearby allies clear their conditions.";
  },
  corridor: ({ battle, actor }) => {
    battle.units
      .filter((unit) => unit.side !== actor.side && distance(unit.position, actor.position) <= 3)
      .forEach((unit) => condition(unit, "jammed"));
    return "Nearby enemies stand down for this round; their intents become Guard.";
  },
  grid: ({ battle, actor, point }) => {
    if (actor.position.x !== point.x && actor.position.y !== point.y)
      throw new Error("Choose a tile in the same row or column.");
    if (distance(actor.position, point) > 3 || !visible(battle, actor.position, point))
      throw new Error("Choose a visible tile within 3.");
    const dx = Math.sign(point.x - actor.position.x);
    const dy = Math.sign(point.y - actor.position.y);
    for (let i = 1; i <= distance(actor.position, point); i += 1)
      setTile(battle, { x: actor.position.x + dx * i, y: actor.position.y + dy * i }, "c");
    return "A line of linked cover protects the route.";
  },
  disable: (context) => {
    const target = requireTarget(context, "enemy", 1);
    if (target.kind === "human") throw new Error("Choose a machine.");
    target.vitality = 0;
    return "Machine safely disabled.";
  },
  jam: (context) => {
    condition(requireTarget(context, "enemy", 4), "jammed");
    return "Enemy jammed: declared intent becomes Guard.";
  },
  return: (context) => {
    const target = requireTarget(context, "enemy", 4);
    if (target.template !== "field-coordinator") throw new Error("Choose a field coordinator.");
    target.surrendered = true;
    return "The coordinator accepts the returned order and stands down.";
  },
  stand: ({ battle, actor }) => {
    let count = 0;
    battle.units
      .filter(
        (unit) =>
          unit.side !== actor.side && alive(unit) && distance(unit.position, actor.position) <= 3
      )
      .forEach((unit) => {
        if (surrenderEligible(battle, unit, 3)) {
          unit.surrendered = true;
          count += 1;
        }
      });
    if (!count) throw new Error("No isolated human enemies at 3 vitality or less within 3 tiles.");
    return `${count} enemies surrender.`;
  },
  record: (context) => {
    const target = requireTarget(context, "enemy", 6);
    context.actor.power = target.power;
    context.actor.range = target.range;
    return `Copied weapon: power ${target.power}, range ${target.range}, until mission end.`;
  },
};

export function applyAbility(battle: Battle, actor: Unit, point: Point, item: Ability): string {
  if (isPassive(item)) throw new Error("This skill applies automatically.");
  if (actor.conditions.includes("jammed")) throw new Error("Skills are unavailable while Jammed.");
  return effects[item.id]({ battle, actor, point, target: unitAt(battle, point) ?? null, item });
}
