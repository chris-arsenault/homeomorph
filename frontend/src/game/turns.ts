import { encounters } from "../content/encounters";
import { alive, clear, neighbors, open, same, setTile } from "./board";
import { declareIntents, resolveEnemy } from "./intents";
import type { Battle, Difficulty, Point } from "./types";
import { createUnit } from "./units";

export function checkOutcome(battle: Battle): void {
  const encounter = encounters[battle.mission];
  if (!battle.units.some((unit) => unit.side === "crew" && alive(unit))) {
    battle.outcome = "lost";
    return;
  }
  const completed = battle.objectives
    .filter((task) => !task.optional)
    .every((task) => task.progress >= task.needed);
  if (completed && battle.round >= encounter.holdRounds) {
    battle.outcome = "won";
    return;
  }
  if (battle.pressure >= 8 || (encounter.deadline > 0 && battle.round > encounter.deadline))
    battle.outcome = "lost";
}

export function shiftPoint(battle: Battle): Point {
  const original = encounters[battle.mission].map === "receiving" ? { x: 5, y: 3 } : { x: 5, y: 4 };
  return original;
}

export function displacement(battle: Battle): Point | null {
  const point = shiftPoint(battle);
  const occupant = battle.units.find((unit) => alive(unit) && same(unit.position, point));
  if (!occupant || occupant.conditions.includes("braced")) return null;
  return neighbors(point).find((tile) => open(battle, tile)) ?? null;
}

function applyShift(battle: Battle): void {
  const point = shiftPoint(battle);
  const occupant = battle.units.find((unit) => alive(unit) && same(unit.position, point));
  const destination = displacement(battle);
  setTile(battle, { x: 5, y: 1 }, ".");
  if (occupant && !destination) {
    battle.log.push(
      "The threshold remains open around the braced or blocked unit. The upper route opens."
    );
  } else {
    if (occupant && destination) occupant.position = destination;
    setTile(battle, point, "#");
    const moved = occupant ? ` ${occupant.name} moves to the previewed safe tile.` : "";
    battle.log.push(
      `The Long Turn closes ${point.x},${point.y} and opens the upper passage.${moved}`
    );
  }
  battle.shifted = true;
}

export function reinforcementPoint(battle: Battle): Point {
  return (
    [
      { x: 10, y: 1 },
      { x: 10, y: 7 },
      { x: 9, y: 1 },
    ].find((point) => open(battle, point)) ?? { x: 10, y: 1 }
  );
}

function reinforce(battle: Battle, difficulty: Difficulty): void {
  const encounter = encounters[battle.mission];
  if (
    !encounter.reinforcement ||
    battle.reinforcementsArrived ||
    battle.round < 5 + difficulty.reinforcementDelay
  )
    return;
  const point = reinforcementPoint(battle);
  if (!open(battle, point)) {
    battle.log.push("Reinforcement delayed: all announced entry tiles are occupied.");
    return;
  }
  const unit = createUnit(
    encounter.reinforcement,
    `reinforcement-${battle.mission}`,
    point,
    [],
    difficulty.eliteVitality
  );
  unit.guard = battle.units.some((hero) => hero.skills.includes("nera-known-procedure")) ? 0 : 1;
  battle.units.push(unit);
  battle.reinforcementsArrived = true;
  battle.log.push(`Reinforcement: ${unit.name} at ${point.x},${point.y}.`);
}

function newRound(battle: Battle, difficulty: Difficulty): void {
  battle.round += 1;
  const encounter = encounters[battle.mission];
  if (!battle.shifted && encounter.shiftRound > 0 && battle.round >= encounter.shiftRound)
    applyShift(battle);
  if (battle.mission === 8 && battle.round === 6) {
    setTile(battle, shiftPoint(battle), "+");
    battle.log.push("The second Turn reconnects the central threshold.");
  }
  reinforce(battle, difficulty);
  battle.units.forEach((unit) => {
    unit.ready = alive(unit);
  });
  battle.log.push(`Round ${battle.round}. All enemy intents declared.`);
  checkOutcome(battle);
  declareIntents(battle);
}

export function endActivation(battle: Battle, difficulty: Difficulty): void {
  const actor = battle.units.find((unit) => unit.id === battle.activeId);
  if (!actor) throw new Error("Choose a ready crew member first.");
  actor.ready = false;
  clear(actor, "jammed");
  battle.activeId = null;
  battle.ap = 0;
  const next = () =>
    battle.units.find((unit) => unit.side === "enemy" && alive(unit) && unit.ready);
  const enemy = next();
  if (enemy) resolveEnemy(battle, enemy);
  checkOutcome(battle);
  if (battle.outcome !== "playing") return;
  if (battle.units.some((unit) => unit.side === "crew" && alive(unit) && unit.ready)) return;
  for (let remaining = next(); remaining; remaining = next()) {
    resolveEnemy(battle, remaining);
    checkOutcome(battle);
    if (battle.outcome !== "playing") return;
  }
  newRound(battle, difficulty);
}
