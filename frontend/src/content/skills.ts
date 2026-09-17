import { selectable } from "./abilities";
import type { SkillChoiceDefinition } from "./types";

const choices: readonly [string, string, 1 | 2 | 3, string][] = [
  ["mara-holdfast", "mara", 1, "Anchor"],
  ["mara-clear-order", "mara", 1, "Coordinator"],
  ["mara-shelter-line", "mara", 2, "Anchor"],
  ["mara-hand-signal", "mara", 2, "Coordinator"],
  ["mara-here-we-stand", "mara", 3, "Anchor"],
  ["mara-second-plan", "mara", 3, "Coordinator"],
  ["iven-read-threshold", "iven", 1, "Pathfinder"],
  ["iven-angle-found", "iven", 1, "Opportunist"],
  ["iven-slip-route", "iven", 2, "Pathfinder"],
  ["iven-pass-it-on", "iven", 2, "Opportunist"],
  ["iven-known-way", "iven", 3, "Pathfinder"],
  ["iven-already-gone", "iven", 3, "Opportunist"],
  ["sela-field-care", "sela", 1, "Triage"],
  ["sela-terms-spoken", "sela", 1, "Advocate"],
  ["sela-stabilize", "sela", 2, "Triage"],
  ["sela-witness", "sela", 2, "Advocate"],
  ["sela-nobody-lost", "sela", 3, "Triage"],
  ["sela-open-corridor", "sela", 3, "Advocate"],
  ["tarn-good-brace", "tarn", 1, "Builder"],
  ["tarn-shear-pin", "tarn", 1, "Breaker"],
  ["tarn-bypass", "tarn", 2, "Builder"],
  ["tarn-make-a-door", "tarn", 2, "Breaker"],
  ["tarn-neighborhood-grid", "tarn", 3, "Builder"],
  ["tarn-clean-stop", "tarn", 3, "Breaker"],
  ["nera-countermand", "nera", 1, "Interdictor"],
  ["nera-known-procedure", "nera", 1, "Witness"],
  ["nera-return-order", "nera", 2, "Interdictor"],
  ["nera-chain-of-custody", "nera", 2, "Witness"],
  ["nera-stand-down", "nera", 3, "Interdictor"],
  ["nera-full-record", "nera", 3, "Witness"],
];

export const skillChoices: readonly SkillChoiceDefinition[] = choices.map(
  ([id, characterId, tier, branch]) => ({
    id,
    characterId,
    tier,
    branch,
    name: selectable[id].name,
    effect: selectable[id].description,
  })
);
