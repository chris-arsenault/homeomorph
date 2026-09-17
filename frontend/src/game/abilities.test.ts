import { describe, expect, it } from "vitest";
import { transition } from "./actions";
import { condition, strike, updateTethers } from "./board";
import { deploy, dispatch, newSession } from "./campaign";
import { declareIntents, describeIntent, forecastIntents, resolveEnemy } from "./intents";
import type { Battle, Session } from "./types";
import { createUnit } from "./units";

function selected(hero: string): Session & { battle: Battle } {
  const roster = ["mara", "iven", "sela", "tarn", "nera"]
    .filter((id) => id === hero || id !== "tarn")
    .slice(0, 4);
  if (!roster.includes(hero)) roster[3] = hero;
  const session = dispatch(deploy({ ...newSession(), mission: 8, roster }), {
    type: "select",
    unitId: hero,
  });
  if (!session.battle) throw new Error("Expected a mission");
  return { ...session, battle: session.battle };
}

describe("core kits and progression mechanics", () => {
  it("allows surrender only when a human enemy is injured and isolated", () => {
    const session = selected("sela");
    const actor = session.battle.units.find((unit) => unit.id === "sela")!;
    const target = session.battle.units.find((unit) => unit.side === "enemy")!;
    target.position = { x: actor.position.x + 1, y: actor.position.y };
    const command = { type: "act", action: "core2", target: target.position } as const;
    expect(transition(session.battle, command, session.difficulty).legal).toBe(false);
    target.vitality = 2;
    const result = transition(session.battle, command, session.difficulty);
    expect(result.legal).toBe(true);
    expect(result.state.units.find((unit) => unit.id === target.id)?.surrendered).toBe(true);
    expect(target.surrendered).toBe(false);
  });

  it("allows the free post-strike move exactly once per activation", () => {
    const session = selected("iven");
    const actor = session.battle.units.find((unit) => unit.id === "iven")!;
    actor.skills = ["iven-angle-found", "iven-slip-route", "iven-already-gone"];
    const command = { type: "act", action: "skill3", target: { x: 3, y: 4 } } as const;
    expect(transition(session.battle, command, session.difficulty).legal).toBe(false);
    actor.used.push("turn-strike");
    session.battle.ap = 0;
    const result = transition(session.battle, command, session.difficulty);
    expect(result.legal).toBe(true);
    expect(result.state.ap).toBe(0);
    expect(
      transition(result.state, { ...command, target: { x: 2, y: 3 } }, session.difficulty).legal
    ).toBe(false);
  });

  it("bounds Second Plan to one extra activation per mission", () => {
    const session = selected("mara");
    const actor = session.battle.units[0];
    actor.skills = ["mara-clear-order", "mara-hand-signal", "mara-second-plan"];
    const ally = session.battle.units[1];
    ally.ready = false;
    const command = { type: "act", action: "skill3", target: ally.position } as const;
    const result = transition(session.battle, command, session.difficulty);
    expect(result.legal).toBe(true);
    expect(result.state.units[1].ready).toBe(true);
    result.state.units[1].ready = false;
    result.state.ap = 2;
    expect(transition(result.state, command, session.difficulty).legal).toBe(false);
  });

  it("breaks only the damaged drone's tether and also breaks tethers by distance", () => {
    const battle = selected("mara").battle;
    const first = createUnit("restraint-drone", "drone-a", { x: 2, y: 2 });
    const second = createUnit("restraint-drone", "drone-b", { x: 2, y: 3 });
    battle.units.push(first, second);
    const [mara, iven] = battle.units;
    condition(mara, "restrained");
    mara.restraintSource = first.id;
    condition(iven, "restrained");
    iven.restraintSource = second.id;
    strike(battle, mara, first);
    expect(mara.conditions).not.toContain("restrained");
    expect(iven.conditions).toContain("restrained");
    iven.position = { x: 9, y: 7 };
    updateTethers(battle);
    expect(iven.conditions).not.toContain("restrained");
  });
});

describe("enemy forecast", () => {
  it("lets distant enemies advance under a move-and-Guard declaration", () => {
    const battle = selected("mara").battle;
    const enemy = createUnit("retrieval-officer", "advance", { x: 10, y: 7 });
    battle.units = [battle.units[0], enemy];
    declareIntents(battle);
    const plan = battle.intents[0];
    expect(plan.action).toBe("guard");
    expect(plan.path.length).toBeGreaterThan(0);
    resolveEnemy(battle, enemy);
    expect(enemy.position).toEqual(plan.destination);
    expect(enemy.guard).toBe(1);
  });

  it("invalidates the surveyor's fixed aim when the target leaves the marked tile", () => {
    const battle = selected("mara").battle;
    const enemy = createUnit("surveyor", "lane", { x: 4, y: 2 });
    battle.units = [battle.units[0], enemy];
    declareIntents(battle);
    battle.units[0].position = { x: 1, y: 1 };
    expect(describeIntent(battle, battle.intents[0])).toContain("marked tile");
  });

  it("forecasts accumulated Marked and Guard changes in enemy order without mutating play", () => {
    const battle = selected("mara").battle;
    const hero = battle.units[0];
    hero.guard = 1;
    battle.units = [
      hero,
      createUnit("retrieval-officer", "one", { x: 2, y: 2 }),
      createUnit("retrieval-officer", "two", { x: 2, y: 3 }),
    ];
    declareIntents(battle);
    const before = JSON.stringify(battle);
    const predictions = forecastIntents(battle);
    expect(predictions[0].description).toContain("−1 vitality");
    expect(predictions[1].description).toContain("−3 vitality");
    expect(JSON.stringify(battle)).toBe(before);
  });
});
