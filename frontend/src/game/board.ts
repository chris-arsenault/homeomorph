import type { Battle, Point, Unit } from "./types";
import { damageAfterProtection, gridDistance } from "./combat";

export const WIDTH = 12;
export const HEIGHT = 9;
export const distance = gridDistance;
export const same = (a: Point, b: Point): boolean => a.x === b.x && a.y === b.y;
export const key = (p: Point): string => `${p.x},${p.y}`;
export const alive = (unit: Unit): boolean => unit.vitality > 0 && !unit.surrendered;
export const tileAt = (battle: Battle, p: Point): string => battle.tiles[p.y]?.[p.x] ?? "#";
export const neighbors = (p: Point): Point[] => [
  { x: p.x, y: p.y - 1 },
  { x: p.x + 1, y: p.y },
  { x: p.x, y: p.y + 1 },
  { x: p.x - 1, y: p.y },
];

export function unitAt(battle: Battle, p: Point): Unit | undefined {
  return battle.units.find((unit) => same(unit.position, p) && alive(unit));
}

export function open(battle: Battle, p: Point, movingId = ""): boolean {
  if (tileAt(battle, p) === "#") return false;
  return !battle.units.some(
    (unit) => unit.id !== movingId && alive(unit) && same(unit.position, p)
  );
}

export function setTile(battle: Battle, p: Point, tile: string): void {
  const row = battle.tiles[p.y];
  battle.tiles[p.y] = row.slice(0, p.x) + tile + row.slice(p.x + 1);
}

export function pathTo(battle: Battle, unit: Unit, target: Point, limit: number): Point[] | null {
  const queue: Point[][] = [[unit.position]];
  const visited = new Set([key(unit.position)]);
  for (let index = 0; index < queue.length; index += 1) {
    const path = queue[index];
    const last = path[path.length - 1];
    if (same(last, target)) return path.slice(1);
    if (path.length > limit) continue;
    for (const next of neighbors(last)) {
      if (visited.has(key(next)) || !open(battle, next, unit.id)) continue;
      visited.add(key(next));
      queue.push([...path, next]);
    }
  }
  return null;
}

export function visible(battle: Battle, from: Point, to: Point): boolean {
  const steps = Math.max(Math.abs(to.x - from.x), Math.abs(to.y - from.y)) * 2;
  for (let index = 1; index < steps; index += 1) {
    const x = from.x + ((to.x - from.x) * index) / steps;
    const y = from.y + ((to.y - from.y) * index) / steps;
    if (tileAt(battle, { x: Math.round(x), y: Math.round(y) }) === "#") return false;
  }
  return true;
}

export function movement(unit: Unit): number {
  if (unit.conditions.includes("restrained")) return 1;
  return unit.movement + (unit.skills.includes("iven-read-threshold") ? 1 : 0);
}

export function condition(unit: Unit, status: Unit["conditions"][number]): void {
  if (!unit.conditions.includes(status)) unit.conditions.push(status);
}

export function clear(unit: Unit, status: Unit["conditions"][number]): void {
  unit.conditions = unit.conditions.filter((item) => item !== status);
  if (status === "restrained") unit.restraintSource = null;
}

export function coverFor(battle: Battle, unit: Unit): number {
  const ownCover = tileAt(battle, unit.position) === "c";
  const shield = battle.units.some(
    (other) =>
      alive(other) &&
      other.side === unit.side &&
      other.template === "brace-carrier" &&
      distance(other.position, unit.position) <= 1
  );
  const shelter = battle.units.some(
    (other) =>
      alive(other) &&
      other.side === unit.side &&
      other.skills.includes("mara-shelter-line") &&
      tileAt(battle, other.position) === "c" &&
      distance(other.position, unit.position) <= 1
  );
  return ownCover || shield || shelter ? 1 : 0;
}

export function damage(battle: Battle, attacker: Unit, defender: Unit, bonus = 0): number {
  const mark = defender.conditions.includes("marked") ? 1 : 0;
  const angle = attacker.moved && attacker.skills.includes("iven-angle-found") ? 1 : 0;
  const armor = defender.conditions.includes("exposed") ? 0 : defender.armor;
  return damageAfterProtection(
    attacker.power + mark + angle + bonus,
    armor,
    coverFor(battle, defender),
    defender.guard
  );
}

export function strike(battle: Battle, attacker: Unit, defender: Unit, bonus = 0): string {
  const loss = Math.min(defender.vitality, damage(battle, attacker, defender, bonus));
  const wasMarked = defender.conditions.includes("marked");
  defender.vitality -= loss;
  if (loss > 0) defender.guard = 0;
  clear(defender, "marked");
  clear(defender, "exposed");
  if (loss > 0) strikeConditions(battle, attacker, defender);
  if (!alive(defender) && wasMarked && attacker.skills.includes("iven-pass-it-on")) {
    const next = battle.units
      .filter((unit) => alive(unit) && unit.side !== attacker.side)
      .sort(
        (a, b) => distance(a.position, defender.position) - distance(b.position, defender.position)
      )[0];
    if (next) condition(next, "marked");
  }
  const ending = defender.vitality === 0 ? " Incapacitated." : "";
  return `${attacker.name} → ${defender.name}: ${loss} vitality.${ending}`;
}

function strikeConditions(battle: Battle, attacker: Unit, defender: Unit): void {
  if (attacker.template === "restraint-drone") {
    condition(defender, "restrained");
    defender.restraintSource = attacker.id;
  }
  if (attacker.template === "retrieval-officer") condition(defender, "marked");
  if (defender.template === "restraint-drone")
    battle.units
      .filter((unit) => unit.restraintSource === defender.id)
      .forEach((unit) => clear(unit, "restrained"));
}

export function updateTethers(battle: Battle): void {
  for (const unit of battle.units) {
    if (!unit.restraintSource) continue;
    const source = battle.units.find((entry) => entry.id === unit.restraintSource);
    if (!source || !alive(source) || distance(source.position, unit.position) > 3)
      clear(unit, "restrained");
  }
}
