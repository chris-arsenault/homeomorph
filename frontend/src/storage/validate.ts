import { characters } from "../content/characters";
import { enemies } from "../content/enemies";
import { encounters } from "../content/encounters";
import { skillChoices } from "../content/skills";
import type { Session } from "../game/types";

type Check = (value: unknown) => boolean;
const record = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const text: Check = (value) => typeof value === "string" && value.length < 4000;
const bool: Check = (value) => typeof value === "boolean";
const number =
  (min: number, max: number): Check =>
  (value) =>
    typeof value === "number" && Number.isInteger(value) && value >= min && value <= max;
const oneOf =
  (values: readonly unknown[]): Check =>
  (value) =>
    values.includes(value);
const array =
  (check: Check, max = 100): Check =>
  (value) =>
    Array.isArray(value) && value.length <= max && value.every(check);
const nullable =
  (check: Check): Check =>
  (value) =>
    value === null || check(value);
const shape =
  (schema: Record<string, Check>): Check =>
  (value) =>
    record(value) && Object.entries(schema).every(([key, check]) => check(value[key]));
const point = shape({ x: number(0, 11), y: number(0, 8) });
const heroIds = characters.map((character) => character.id);
const templateIds = [...heroIds, ...enemies.map((enemy) => enemy.id)];
const skillIds = skillChoices.map((skill) => skill.id);

const unit = shape({
  id: text,
  template: oneOf(templateIds),
  name: text,
  side: oneOf(["crew", "enemy"]),
  kind: oneOf(["human", "drone", "rig"]),
  position: point,
  vitality: number(0, 100),
  maximumVitality: number(1, 100),
  armor: number(0, 20),
  power: number(0, 20),
  range: number(1, 20),
  movement: number(1, 20),
  guard: number(0, 1),
  conditions: array(oneOf(["marked", "restrained", "braced", "jammed", "exposed"]), 5),
  ready: bool,
  restraintSource: nullable(text),
  surrendered: bool,
  moved: bool,
  used: array(text),
  skills: array(oneOf(skillIds), 3),
});
const intent = shape({
  unitId: text,
  destination: point,
  targetId: nullable(text),
  action: oneOf(["strike", "guard", "lock"]),
  path: array(point, 20),
  aim: nullable(point),
});
const objective = shape({
  id: text,
  name: text,
  position: point,
  needed: number(1, 10),
  progress: number(0, 10),
  optional: bool,
  flag: nullable(text),
});
const tiles: Check = (value) =>
  Array.isArray(value) &&
  value.length === 9 &&
  value.every((row) => typeof row === "string" && /^[#.c+]{12}$/.test(row));
const battle = shape({
  mission: number(0, 9),
  round: number(1, 100000),
  tiles,
  units: array(unit, 30),
  objectives: array(objective, 20),
  activeId: nullable(text),
  ap: number(0, 2),
  intents: array(intent, 20),
  shifted: bool,
  reinforcementsArrived: bool,
  pressure: number(0, 20),
  outcome: oneOf(["playing", "won", "lost"]),
  log: array(text, 60),
});
const difficulty = shape({
  name: oneOf(["Story", "Standard", "Exacting", "Custom"]),
  rewinds: number(-1, 20),
  reinforcementDelay: number(0, 3),
  eliteVitality: number(0, 2),
  optionalRounds: number(-2, 4),
  preview: number(1, 2),
});
const skills: Check = (value) =>
  record(value) &&
  Object.entries(value).every(
    ([id, choices]) =>
      heroIds.includes(id as (typeof heroIds)[number]) && array(oneOf(skillIds), 3)(choices)
  );
const sessionShape = shape({
  version: oneOf([1]),
  stage: oneOf(["briefing", "battle", "debrief", "ending"]),
  mission: number(0, 9),
  completed: array(number(0, 9), 10),
  roster: array(oneOf(heroIds), 4),
  skills,
  flags: array(
    oneOf([
      ...encounters.flatMap((entry) => entry.choices.map((choice) => choice[0])),
      ...encounters.flatMap((entry) => entry.tasks.map((task) => task.flag).filter(Boolean)),
      "mercy",
    ])
  ),
  difficulty,
  battle: nullable(battle),
  checkpoint: nullable(battle),
  rewindsUsed: number(0, 100000),
});

function validProgress(session: Session): boolean {
  const count = session.stage === "ending" ? 10 : session.mission;
  return (
    session.completed.length === count &&
    session.completed.every((mission, index) => mission === index)
  );
}

function validBattle(value: NonNullable<Session["battle"]>, session: Session): boolean {
  const ids = new Set(value.units.map((entry) => entry.id));
  const expected = encounters[session.mission].tasks;
  const objectivesMatch =
    value.objectives.length === expected.length &&
    value.objectives.every(
      (entry, index) =>
        entry.id === expected[index].id &&
        entry.progress <= entry.needed &&
        entry.position.x === expected[index].position.x &&
        entry.position.y === expected[index].position.y
    );
  return (
    value.mission === session.mission &&
    ids.size === value.units.length &&
    objectivesMatch &&
    validActive(value) &&
    validUnits(value, session) &&
    value.units.filter((entry) => entry.side === "crew").length === 4 &&
    value.intents.every(
      (entry) => ids.has(entry.unitId) && (entry.targetId === null || ids.has(entry.targetId))
    )
  );
}

function validUnits(value: NonNullable<Session["battle"]>, session: Session): boolean {
  const occupied = value.units
    .filter((entry) => entry.vitality > 0 && !entry.surrendered)
    .map((entry) => `${entry.position.x},${entry.position.y}`);
  const positionsValid = new Set(occupied).size === occupied.length;
  return (
    positionsValid &&
    value.units.every((entry) => {
      const hero = characters.some((character) => character.id === entry.template);
      if ((entry.side === "crew") !== hero || entry.vitality > entry.maximumVitality) return false;
      if (hero && (entry.id !== entry.template || !session.roster.includes(entry.id))) return false;
      return (
        entry.vitality === 0 ||
        entry.surrendered ||
        value.tiles[entry.position.y][entry.position.x] !== "#"
      );
    })
  );
}

function validActive(value: NonNullable<Session["battle"]>): boolean {
  const active = value.units.find((entry) => entry.id === value.activeId);
  return (
    value.activeId === null ||
    Boolean(active?.ready && active.side === "crew" && active.vitality > 0)
  );
}

function validRoster(session: Session): boolean {
  return (
    new Set(session.roster).size === session.roster.length &&
    (session.stage === "briefing" || session.roster.length === 4) &&
    (session.mission >= 6 || !session.roster.includes("nera"))
  );
}

function validSelections(session: Session): boolean {
  return Object.entries(session.skills).every(([id, choices]) =>
    choices.every((choice, index) =>
      skillChoices.some(
        (skill) => skill.id === choice && skill.characterId === id && skill.tier === index + 1
      )
    )
  );
}

export function parseSession(input: string): Session {
  const value: unknown = JSON.parse(input);
  if (record(value) && value.version !== 1)
    throw new Error(
      "This save uses an unsupported version. Your existing save has not been replaced."
    );
  if (!sessionShape(value))
    throw new Error(
      "This save is incomplete or damaged. Import a valid backup or start a new campaign."
    );
  const session = value as Session;
  const statesMatch = ["battle", "debrief"].includes(session.stage) === (session.battle !== null);
  const snapshots = [session.battle, session.checkpoint].filter((entry) => entry !== null);
  if (
    !statesMatch ||
    !validProgress(session) ||
    !validSelections(session) ||
    !validRoster(session) ||
    !snapshots.every((entry) => validBattle(entry, session))
  )
    throw new Error(
      "This save has inconsistent campaign data. Your existing save has not been replaced."
    );
  return session;
}
