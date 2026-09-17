import { describe, expect, it } from "vitest";
import { transition } from "./actions";
import { alive, distance, pathTo, same, setTile } from "./board";
import { advance, debrief, deploy, dispatch, newSession, rewind } from "./campaign";
import { describeIntent } from "./intents";
import { checkOutcome, displacement, shiftPoint } from "./turns";
import type { Battle, Session } from "./types";
import { encounters } from "../content/encounters";
import { parseSession } from "../storage/validate";

function encounter(mission = 2): Session {
  return deploy({ ...newSession(), mission });
}

function battleOf(session: Session): Battle {
  if (!session.battle) throw new Error("Expected deployed battle");
  return session.battle;
}

describe("deterministic commands", () => {
  it("rejects unreachable moves without mutating the source or spending AP", () => {
    const session = dispatch(encounter(), { type: "select", unitId: "mara" });
    const battle = battleOf(session);
    const before = JSON.stringify(battle);
    const result = transition(
      battle,
      { type: "act", action: "move", target: { x: 0, y: 0 } },
      session.difficulty
    );
    expect(result.legal).toBe(false);
    expect(result.state).toBe(battle);
    expect(JSON.stringify(battle)).toBe(before);
  });

  it("commits exactly the state shown by a preview", () => {
    const session = dispatch(encounter(), { type: "select", unitId: "iven" });
    const command = { type: "act", action: "move", target: { x: 4, y: 3 } } as const;
    const preview = transition(battleOf(session), command, session.difficulty);
    expect(preview.legal).toBe(true);
    expect(dispatch(session, command).battle).toEqual(preview.state);
    expect(preview.state.ap).toBe(1);
  });

  it("blocks attacks through walls and applies cover, Guard and Marked exactly", () => {
    const session = dispatch(encounter(), { type: "select", unitId: "mara" });
    const battle = battleOf(session);
    const target = battle.units.find((unit) => unit.side === "enemy")!;
    target.position = { x: 3, y: 2 };
    target.guard = 1;
    target.conditions = ["marked"];
    const command = { type: "act", action: "strike", target: target.position } as const;
    const result = transition(battle, command, session.difficulty);
    expect(result.legal).toBe(true);
    expect(result.state.units.find((unit) => unit.id === target.id)?.vitality).toBe(1);
    expect(result.state.units.find((unit) => unit.id === target.id)?.conditions).toEqual([]);
    setTile(battle, { x: 2, y: 2 }, "#");
    expect(transition(battle, command, session.difficulty).legal).toBe(false);
  });

  it("retains Guard on zero damage and consumes it on the first damaging strike", () => {
    const session = dispatch(encounter(), { type: "select", unitId: "mara" });
    const battle = battleOf(session);
    const target = battle.units.find((unit) => unit.side === "enemy")!;
    target.position = { x: 2, y: 2 };
    target.armor = 8;
    target.guard = 1;
    const result = transition(
      battle,
      { type: "act", action: "strike", target: target.position },
      session.difficulty
    );
    expect(result.state.units.find((unit) => unit.id === target.id)?.guard).toBe(1);
  });

  it("rewinds enemy consequences and preserves the rewind budget across serialization", () => {
    const original = encounter();
    let session = dispatch(original, { type: "select", unitId: "mara" });
    session = dispatch(session, { type: "act", action: "guard", target: { x: 1, y: 2 } });
    session = dispatch(session, { type: "end" });
    const restored = rewind(JSON.parse(JSON.stringify(session)));
    expect(restored.battle).toEqual(original.battle);
    expect(restored.rewindsUsed).toBe(1);
    expect(rewind(restored)).toBe(restored);
  });
});

describe("intent and round boundaries", () => {
  it("falls back to visible Guard when a declared path is blocked", () => {
    const session = encounter(1);
    const battle = battleOf(session);
    const plan = battle.intents[0];
    expect(plan.path.length).toBeGreaterThan(0);
    const hero = battle.units[0];
    hero.position = plan.path[0];
    expect(describeIntent(battle, plan)).toContain("path blocked");
    const selected = dispatch(session, { type: "select", unitId: hero.id });
    const resolved = dispatch(selected, { type: "end" });
    expect(battleOf(resolved).units.find((unit) => unit.id === plan.unitId)?.guard).toBe(1);
    expect(battleOf(resolved).units[0].vitality).toBe(hero.vitality);
  });

  it("advances peaceful rounds and performs the previewed displacement", () => {
    let session = encounter(0);
    const battle = battleOf(session);
    battle.round = 2;
    battle.units[0].position = shiftPoint(battle);
    const destination = displacement(battle);
    expect(destination).not.toBeNull();
    for (const unit of battle.units) {
      session = dispatch(session, { type: "select", unitId: unit.id });
      session = dispatch(session, { type: "end" });
    }
    expect(battleOf(session).round).toBe(3);
    expect(battleOf(session).shifted).toBe(true);
    expect(battleOf(session).units[0].position).toEqual(destination);
  });

  it("keeps a threshold open when every displacement destination is occupied", () => {
    let session = encounter(0);
    const battle = battleOf(session);
    battle.round = 2;
    battle.units[0].position = shiftPoint(battle);
    battle.units[1].position = { x: 6, y: 4 };
    battle.units[2].position = { x: 4, y: 4 };
    expect(displacement(battle)).toBeNull();
    for (const unit of battle.units) {
      session = dispatch(session, { type: "select", unitId: unit.id });
      session = dispatch(session, { type: "end" });
    }
    expect(battleOf(session).tiles[4][5]).toBe("+");
  });

  it("requires sequential escort checkpoints and respects lock failure", () => {
    const session = dispatch(encounter(4), { type: "select", unitId: "mara" });
    const battle = battleOf(session);
    battle.units[0].position = { x: 10, y: 5 };
    expect(
      transition(
        battle,
        { type: "act", action: "interact", target: { x: 10, y: 6 } },
        session.difficulty
      ).legal
    ).toBe(false);
    battle.pressure = 8;
    checkOutcome(battle);
    expect(battle.outcome).toBe("lost");
  });
});

describe("campaign progression", () => {
  it("applies assistance to the finale without removing required anchors", () => {
    const battle = battleOf(
      deploy({ ...newSession(), mission: 8, flags: ["shared-repair", "open-passage", "mercy"] })
    );
    expect(
      battle.objectives.filter((task) => task.id.startsWith("anchor")).map((task) => task.needed)
    ).toEqual([1, 1, 1]);
    expect(battle.objectives.find((task) => task.id === "passage")?.progress).toBe(1);
    expect(battle.units.find((unit) => unit.template === "field-coordinator")?.surrendered).toBe(
      true
    );
    expect(battle.outcome).toBe("playing");
  });

  it("does not allow progress or story flags without winning and selecting an authored choice", () => {
    const session = encounter();
    expect(debrief(session)).toBe(session);
    expect(advance(session, "shared-repair")).toBe(session);
  });

  it("validates every authored spawn and routes to every objective", () => {
    for (let mission = 0; mission < 10; mission += 1) {
      const battle = battleOf(encounter(mission));
      for (const unit of battle.units)
        expect(battle.tiles[unit.position.y][unit.position.x]).not.toBe("#");
      const crew = battle.units[0];
      battle.units = [crew];
      for (const objective of battle.objectives)
        expect(pathTo(battle, crew, objective.position, 100)).not.toBeNull();
    }
  });
});

// These helpers play real commands, without teleporting or weakening enemy statistics.
function playActivation(session: Session): Session {
  const battle = battleOf(session);
  const hero = battle.units.find((unit) => unit.side === "crew" && unit.ready && alive(unit));
  if (!hero) throw new Error("No ready hero");
  let current = dispatch(session, { type: "select", unitId: hero.id });
  for (let ap = 0; ap < 2; ap += 1) current = chooseAction(current);
  if (battleOf(current).outcome === "playing") current = dispatch(current, { type: "end" });
  return current;
}

function chooseAction(session: Session): Session {
  const battle = battleOf(session);
  const hero = battle.units.find((unit) => unit.id === battle.activeId)!;
  if (battle.outcome !== "playing") return session;
  const tasks = battle.objectives.filter((task) => !task.optional && task.progress < task.needed);
  for (const task of tasks) {
    const command = { type: "act", action: "interact", target: task.position } as const;
    if (transition(battle, command, session.difficulty).legal) return dispatch(session, command);
  }
  const targets = battle.units
    .filter((unit) => unit.side === "enemy" && alive(unit))
    .sort((a, b) => a.vitality - b.vitality);
  for (const target of targets) {
    const command = { type: "act", action: "strike", target: target.position } as const;
    if (transition(battle, command, session.difficulty).legal) return dispatch(session, command);
  }
  const goals = [4, 5].includes(battle.mission) ? tasks.slice(0, 1) : tasks;
  const tiles = battle.tiles.flatMap((row, y) => [...row].map((_, x) => ({ x, y })));
  const candidates = tiles.filter(
    (point) => !same(point, hero.position) && pathTo(battle, hero, point, hero.movement)
  );
  candidates.sort(
    (a, b) =>
      Math.min(...goals.map((goal) => distance(a, goal.position))) -
      Math.min(...goals.map((goal) => distance(b, goal.position)))
  );
  if (candidates[0] && goals.length)
    return dispatch(session, { type: "act", action: "move", target: candidates[0] });
  return dispatch(session, { type: "act", action: "guard", target: hero.position });
}

describe("authored campaign completion", () => {
  it("finishes a continuous campaign while round-tripping every activation through the save boundary", () => {
    let session = newSession();
    for (let mission = 0; mission < 10; mission += 1) {
      session = deploy(session);
      for (let turn = 0; turn < 48 && battleOf(session).outcome === "playing"; turn += 1) {
        session = parseSession(JSON.stringify(playActivation(session)));
      }
      expect(battleOf(session).outcome, `Mission ${mission}`).toBe("won");
      session = advance(debrief(session), encounters[mission].choices[0][0]);
      session = parseSession(JSON.stringify(session));
    }
    expect(session.stage).toBe("ending");
    expect(session.completed).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  it.each(["mara", "iven", "sela", "tarn", "nera"])(
    "completes the finale with %s omitted from deployment",
    (omitted) => {
      const roster = ["mara", "iven", "sela", "tarn", "nera"].filter((id) => id !== omitted);
      let session = deploy({ ...newSession(), mission: 8, roster });
      for (let turn = 0; turn < 48 && battleOf(session).outcome === "playing"; turn += 1)
        session = playActivation(session);
      expect(battleOf(session).outcome, battleOf(session).log.join("\n")).toBe("won");
    }
  );
  it.each(Array.from({ length: 10 }, (_, index) => index))(
    "mission %i can be completed through legal commands on Standard",
    (mission) => {
      let session = encounter(mission);
      for (
        let activation = 0;
        activation < 48 && battleOf(session).outcome === "playing";
        activation += 1
      )
        session = playActivation(session);
      const battle = battleOf(session);
      expect(
        battle.outcome,
        `Mission ${mission}, round ${battle.round}: ${battle.log.join("\n")}`
      ).toBe("won");
    }
  );
});
