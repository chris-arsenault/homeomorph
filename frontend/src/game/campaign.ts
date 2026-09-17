import { characters } from "../content/characters";
import { deploymentPoints, encounters, enemyPoints, mapTiles } from "../content/encounters";
import { skillChoices } from "../content/skills";
import { epilogueAccounts } from "../content/testimony";
import { transition } from "./actions";
import { declareIntents } from "./intents";
import type { Battle, Command, Difficulty, Session } from "./types";
import { createUnit } from "./units";

export const difficulties: readonly Difficulty[] = [
  {
    name: "Story",
    rewinds: -1,
    reinforcementDelay: 1,
    eliteVitality: 0,
    optionalRounds: 3,
    preview: 2,
  },
  {
    name: "Standard",
    rewinds: 3,
    reinforcementDelay: 0,
    eliteVitality: 0,
    optionalRounds: 0,
    preview: 1,
  },
  {
    name: "Exacting",
    rewinds: 1,
    reinforcementDelay: 0,
    eliteVitality: 1,
    optionalRounds: -2,
    preview: 1,
  },
];

export function newSession(difficulty: Difficulty = difficulties[1]): Session {
  return {
    version: 1,
    stage: "briefing",
    mission: 0,
    completed: [],
    roster: ["mara", "iven", "sela", "tarn"],
    skills: {},
    flags: [],
    difficulty: { ...difficulty },
    battle: null,
    checkpoint: null,
    rewindsUsed: 0,
  };
}

export function unlockedTiers(session: Session): number {
  return [2, 5, 7].filter((mission) => session.completed.includes(mission)).length;
}

export function availableRoster(session: Session): string[] {
  return characters
    .filter((character) => character.id !== "nera" || session.mission >= 6)
    .map((character) => character.id);
}

function skillSelection(session: Session, id: string): string[] {
  return Array.from(
    { length: unlockedTiers(session) },
    (_, index) =>
      session.skills[id]?.[index] ??
      skillChoices.find((skill) => skill.characterId === id && skill.tier === index + 1)!.id
  );
}

function finaleAssistance(battle: Battle, flags: string[]): void {
  if (battle.mission !== 8) return;
  if (flags.includes("shared-repair")) {
    battle.objectives
      .filter((task) => task.id.startsWith("anchor"))
      .forEach((task) => {
        task.needed = 1;
      });
    battle.log.push("Vale's team prepares the anchors: each repair now needs 1 interaction.");
  }
  if (flags.some((flag) => ["open-passage", "ari-trusted"].includes(flag))) {
    const passage = battle.objectives.find((task) => task.id === "passage");
    if (passage) passage.progress = passage.needed;
    battle.log.push("Civilian crews keep voluntary passage open.");
  }
  if (flags.some((flag) => ["mercy", "nera-speaks"].includes(flag))) {
    const enemy = battle.units.find((unit) => unit.template === "field-coordinator");
    if (enemy) enemy.surrendered = true;
    battle.log.push("The coordinator refuses Renn's custody order and stands down.");
  }
  if (flags.includes("local-truth")) {
    battle.pressure = 0;
    battle.units
      .filter((unit) => unit.side === "crew")
      .forEach((unit) => {
        unit.guard = 1;
      });
    battle.log.push("Public testimony buys the crew cover: everyone begins with Guard.");
  }
}

export function deploy(session: Session): Session {
  if (
    session.stage !== "briefing" ||
    session.roster.length !== 4 ||
    new Set(session.roster).size !== 4
  )
    return session;
  if (session.roster.some((id) => !availableRoster(session).includes(id))) return session;
  const encounter = encounters[session.mission];
  const battle: Battle = {
    mission: session.mission,
    round: 1,
    tiles: mapTiles(session.mission),
    activeId: null,
    ap: 0,
    units: [
      ...session.roster.map((id, index) =>
        createUnit(id, id, deploymentPoints[index], skillSelection(session, id))
      ),
      ...encounter.enemies.map((id, index) =>
        createUnit(id, `enemy-${index}`, enemyPoints[index], [], session.difficulty.eliteVitality)
      ),
    ],
    objectives: encounter.tasks.map((task) => ({
      ...task,
      optional: task.optional ?? false,
      flag: task.flag ?? null,
      progress: 0,
    })),
    intents: [],
    shifted: false,
    reinforcementsArrived: false,
    pressure: 0,
    outcome: "playing",
    log: ["Round 1. Choose a ready crew member."],
  };
  finaleAssistance(battle, session.flags);
  declareIntents(battle);
  return { ...session, stage: "battle", battle, checkpoint: null, rewindsUsed: 0 };
}

export function dispatch(session: Session, command: Command): Session {
  if (session.stage !== "battle" || !session.battle) return session;
  const result = transition(session.battle, command, session.difficulty);
  if (!result.legal) return session;
  if (session.mission === 9 && command.type === "act" && command.action === "interact") {
    const task = result.state.objectives.find(
      (entry) => entry.position.x === command.target.x && entry.position.y === command.target.y
    );
    if (task) result.state.log.push(epilogueAccounts(session.flags)[task.id]);
  }
  const checkpoint =
    command.type === "select" ? structuredClone(session.battle) : session.checkpoint;
  return { ...session, battle: result.state, checkpoint };
}

export function rewind(session: Session): Session {
  const limit = session.difficulty.rewinds;
  if (!session.checkpoint || (limit >= 0 && session.rewindsUsed >= limit)) return session;
  return {
    ...session,
    stage: "battle",
    battle: structuredClone(session.checkpoint),
    checkpoint: null,
    rewindsUsed: session.rewindsUsed + 1,
  };
}

export function debrief(session: Session): Session {
  if (session.battle?.outcome !== "won") return session;
  const optionalFlags = session.battle.objectives
    .filter((task) => task.optional && task.progress >= task.needed && task.flag)
    .map((task) => task.flag!);
  const mercy = session.battle.units.some((unit) => unit.side === "enemy" && unit.surrendered)
    ? ["mercy"]
    : [];
  return {
    ...session,
    stage: "debrief",
    flags: [...new Set([...session.flags, ...optionalFlags, ...mercy])],
    checkpoint: null,
  };
}

export function advance(session: Session, flag: string): Session {
  if (
    session.stage !== "debrief" ||
    !encounters[session.mission].choices.some((choice) => choice[0] === flag)
  )
    return session;
  const completed = [...new Set([...session.completed, session.mission])];
  const stage = session.mission === 9 ? "ending" : "briefing";
  return {
    ...session,
    completed,
    flags: [...new Set([...session.flags, flag])],
    stage,
    mission: Math.min(9, session.mission + 1),
    battle: null,
    checkpoint: null,
    rewindsUsed: 0,
  };
}

export function restart(session: Session): Session {
  return { ...session, stage: "briefing", battle: null, checkpoint: null, rewindsUsed: 0 };
}
