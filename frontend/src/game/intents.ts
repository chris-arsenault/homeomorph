import {
  alive,
  condition,
  damage,
  distance,
  movement,
  open,
  pathTo,
  same,
  strike,
  visible,
} from "./board";
import type { Battle, Intent, Unit } from "./types";

function planEnemy(battle: Battle, enemy: Unit): Intent {
  const target = battle.units
    .filter((unit) => unit.side === "crew" && alive(unit))
    .sort((a, b) => distance(a.position, enemy.position) - distance(b.position, enemy.position))[0];
  const plan: Intent = {
    unitId: enemy.id,
    destination: enemy.position,
    targetId: target?.id ?? null,
    action: "guard",
    path: [],
    aim: null,
  };
  if (!target) return plan;
  if (enemy.template === "surveyor") plan.aim = { ...target.position };
  if (channelsLock(battle, enemy)) return { ...plan, action: "lock" };
  const candidates = battle.tiles
    .flatMap((row, y) => [...row].map((_, x) => ({ x, y })))
    .filter(
      (point) => open(battle, point, enemy.id) && distance(enemy.position, point) <= movement(enemy)
    )
    .map((point) => ({ point, path: pathTo(battle, enemy, point, movement(enemy)) }))
    .filter((entry) => entry.path !== null)
    .sort((a, b) => distance(a.point, target.position) - distance(b.point, target.position));
  if (canStrikeFrom(battle, enemy, enemy.position, target)) return { ...plan, action: "strike" };
  const destination =
    candidates.find(
      (entry) =>
        distance(entry.point, target.position) <= enemy.range &&
        visible(battle, entry.point, target.position)
    ) ?? candidates[0];
  if (!destination) return plan;
  return {
    ...plan,
    destination: destination.point,
    path: destination.path!,
    action: canStrikeFrom(battle, enemy, destination.point, target) ? "strike" : "guard",
  };
}

function channelsLock(battle: Battle, enemy: Unit): boolean {
  return enemy.template === "lock-engineer" && battle.mission >= 6;
}

function canStrikeFrom(
  battle: Battle,
  enemy: Unit,
  position: Unit["position"],
  target: Unit
): boolean {
  return (
    distance(position, target.position) <= enemy.range && visible(battle, position, target.position)
  );
}

export function declareIntents(battle: Battle): void {
  battle.intents = battle.units
    .filter((unit) => unit.side === "enemy" && alive(unit) && unit.ready)
    .map((unit) => planEnemy(battle, unit));
}

export function intentBlock(battle: Battle, intent: Intent): string | null {
  const enemy = battle.units.find((unit) => unit.id === intent.unitId);
  if (!enemy || !alive(enemy)) return "incapacitated or surrendered";
  if (enemy.conditions.includes("jammed")) return "jammed";
  if (intent.path.some((point) => !open(battle, point, enemy.id))) return "declared path blocked";
  if (intent.action !== "strike") return null;
  return targetBlock(battle, intent, enemy);
}

function targetBlock(battle: Battle, intent: Intent, enemy: Unit): string | null {
  const target = battle.units.find((unit) => unit.id === intent.targetId);
  if (!target || !alive(target)) return "target unavailable";
  if (intent.aim && !same(intent.aim, target.position))
    return "target left the surveyor's marked tile";
  if (distance(intent.destination, target.position) > enemy.range)
    return "target moved out of range";
  if (!visible(battle, intent.destination, target.position)) return "line of sight blocked";
  return null;
}

function commandBonus(battle: Battle, enemy: Unit): number {
  const witness = battle.units.some(
    (unit) =>
      alive(unit) &&
      unit.skills.includes("sela-witness") &&
      distance(unit.position, enemy.position) <= 1
  );
  if (witness) return 0;
  return battle.units.some(
    (unit) =>
      unit.template === "field-coordinator" &&
      alive(unit) &&
      !unit.conditions.includes("jammed") &&
      unit.id !== enemy.id &&
      distance(unit.position, enemy.position) <= 2
  )
    ? 1
    : 0;
}

export function describeIntent(battle: Battle, intent: Intent): string {
  const enemy = battle.units.find((unit) => unit.id === intent.unitId);
  const blocked = intentBlock(battle, intent);
  if (blocked) return `Guard (${blocked})`;
  if (intent.action === "lock") return "Channel lock: +1 pressure (failure at 8)";
  if (!enemy) return "Guard";
  if (intent.action === "guard")
    return `Move to ${intent.destination.x},${intent.destination.y}; Guard: reduce next damaging strike by 1`;
  const target = battle.units.find((unit) => unit.id === intent.targetId);
  if (!target) return "Guard";
  const afterMove = { ...enemy, position: intent.destination };
  const loss = Math.min(
    target.vitality,
    damage(battle, afterMove, target, commandBonus(battle, afterMove))
  );
  const move = same(enemy.position, intent.destination)
    ? ""
    : `Move to ${intent.destination.x},${intent.destination.y}; `;
  const status = enemy.template === "restraint-drone" ? "; Restrained" : "; Marked";
  const applies = loss > 0 && ["restraint-drone", "retrieval-officer"].includes(enemy.template);
  return `${move}${target.name}: −${loss} vitality${applies ? status : ""}`;
}

export function resolveEnemy(battle: Battle, enemy: Unit): void {
  const intent = battle.intents.find((entry) => entry.unitId === enemy.id);
  enemy.ready = false;
  enemy.guard = 0;
  const blocked = intent ? intentBlock(battle, intent) : "no declared action";
  if (!intent || blocked) {
    enemy.guard = 1;
    enemy.conditions = enemy.conditions.filter((item) => item !== "jammed");
    battle.log.push(`${enemy.name}: Guard (${blocked}).`);
    return;
  }
  enemy.position = intent.destination;
  if (intent.action === "lock") {
    battle.pressure += 1;
    battle.log.push(`${enemy.name}: lock pressure +1 (${battle.pressure}/8).`);
    return;
  }
  const target = battle.units.find((unit) => unit.id === intent.targetId);
  if (intent.action === "strike" && target)
    battle.log.push(strike(battle, enemy, target, commandBonus(battle, enemy)));
  else {
    enemy.guard = 1;
    battle.log.push(`${enemy.name} guards.`);
  }
  if (enemy.template === "linebreaker-rig") condition(enemy, "exposed");
}

export function forecastIntents(source: Battle) {
  const battle = structuredClone(source);
  return battle.intents
    .filter((intent) =>
      battle.units.some((unit) => unit.id === intent.unitId && unit.ready && alive(unit))
    )
    .map((intent) => {
      const enemy = battle.units.find((unit) => unit.id === intent.unitId)!;
      const result = { intent, name: enemy.name, description: describeIntent(battle, intent) };
      resolveEnemy(battle, enemy);
      return result;
    });
}
