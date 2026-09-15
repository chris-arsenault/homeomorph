import { describe, expect, it } from "vitest";
import { gridDistance, previewStrike, type Combatant, type WeaponProfile } from "./combat";

const attacker: Combatant = {
  id: "mara",
  vitality: 6,
  armor: 1,
  guard: 0,
  position: { x: 1, y: 1 },
};

const weapon: WeaponProfile = { power: 4, minimumRange: 1, maximumRange: 3 };

describe("gridDistance", () => {
  it("uses orthogonal square-grid distance", () => {
    expect(gridDistance({ x: 1, y: 1 }, { x: 3, y: 4 })).toBe(5);
  });
});

describe("previewStrike", () => {
  it("shows exact deterministic damage", () => {
    const defender: Combatant = {
      id: "officer",
      vitality: 4,
      armor: 1,
      guard: 1,
      position: { x: 3, y: 1 },
    };

    expect(previewStrike(attacker, defender, weapon, 1)).toEqual({
      legal: true,
      damage: 1,
      remainingVitality: 3,
      consumesGuard: true,
      incapacitates: false,
    });
  });

  it("reports an attack outside its visible range", () => {
    const defender: Combatant = {
      id: "surveyor",
      vitality: 4,
      armor: 0,
      guard: 0,
      position: { x: 7, y: 1 },
    };

    expect(previewStrike(attacker, defender, weapon, 0)).toEqual({
      legal: false,
      reason: "outside-range",
    });
  });

  it("previews incapacitation without negative vitality", () => {
    const defender: Combatant = {
      id: "drone",
      vitality: 2,
      armor: 0,
      guard: 0,
      position: { x: 2, y: 1 },
    };

    expect(previewStrike(attacker, defender, weapon, 0)).toMatchObject({
      legal: true,
      remainingVitality: 0,
      incapacitates: true,
    });
  });
});
