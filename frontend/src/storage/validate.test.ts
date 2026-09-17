import { describe, expect, it } from "vitest";
import { deploy, dispatch, newSession } from "../game/campaign";
import { parseSession } from "./validate";

describe("local save boundary", () => {
  it("can resume an unfinished deployment selection", () => {
    const session = { ...newSession(), roster: ["mara", "iven", "sela"] };
    expect(parseSession(JSON.stringify(session))).toEqual(session);
  });
  it("rejects overlapping standing units and enemy templates in the player roster", () => {
    const session = deploy(newSession());
    if (!session.battle) throw new Error("Expected battle");
    session.battle.units[1].position = session.battle.units[0].position;
    expect(() => parseSession(JSON.stringify(session))).toThrow("inconsistent");
    session.battle.units[1].position = { x: 1, y: 3 };
    session.battle.units[0].template = "retrieval-officer";
    expect(() => parseSession(JSON.stringify(session))).toThrow("inconsistent");
  });
  it("round-trips active play and the activation checkpoint", () => {
    const session = dispatch(deploy(newSession()), { type: "select", unitId: "mara" });
    expect(parseSession(JSON.stringify(session))).toEqual(session);
  });
  it("rejects unknown versions instead of interpreting future data", () => {
    expect(() => parseSession(JSON.stringify({ ...newSession(), version: 2 }))).toThrow(
      "unsupported version"
    );
  });
  it("rejects malformed JSON, missing fields, invalid coordinates and missing objectives", () => {
    expect(() => parseSession("{")).toThrow();
    expect(() => parseSession("{}")).toThrow();
    const session = deploy(newSession());
    if (!session.battle) throw new Error("Expected battle");
    session.battle.units[0].position = { x: -1, y: 0 };
    expect(() => parseSession(JSON.stringify(session))).toThrow();
    session.battle.units[0].position = { x: 1, y: 2 };
    session.battle.objectives = [];
    expect(() => parseSession(JSON.stringify(session))).toThrow("inconsistent");
  });
  it("rejects impossible progression and skills belonging to another character", () => {
    expect(() => parseSession(JSON.stringify({ ...newSession(), mission: 8 }))).toThrow(
      "inconsistent"
    );
    expect(() =>
      parseSession(JSON.stringify({ ...newSession(), skills: { mara: ["iven-angle-found"] } }))
    ).toThrow("inconsistent");
  });
});
