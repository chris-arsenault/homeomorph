export interface Ability {
  id: string;
  name: string;
  cost: number;
  description: string;
}
const ability = (id: string, name: string, description: string, cost = 1): Ability => ({
  id,
  name,
  cost,
  description,
});
export const core: Record<string, readonly Ability[]> = {
  mara: [
    ability("brace", "Set Point", "Place cover on an adjacent open tile."),
    ability("steady", "Steady", "Give an adjacent ally Guard."),
  ],
  iven: [
    ability(
      "mark",
      "Quick Mark",
      "Mark a visible enemy within 5 tiles; next strike gains 1 power."
    ),
    ability("traverse", "Traverse", "Move up to 7 tiles; restraint limits this to 1."),
  ],
  sela: [
    ability("treat", "Treat", "Restore 1 vitality and clear Marked on an adjacent ally."),
    ability(
      "surrender",
      "Call Down",
      "Invite an isolated human enemy at 2 vitality or less within 3 tiles to surrender."
    ),
  ],
  tarn: [
    ability("brace", "Brace", "Place cover on an adjacent open tile."),
    ability("tool", "Tool Strike", "Adjacent strike with +2 power; +3 against machines."),
  ],
  nera: [
    ability("interpose", "Interpose", "Retarget a visible enemy intent to Nera if in range."),
    ability("codes", "Service Codes", "Disable an adjacent drone or advance a relay objective."),
  ],
};

export const selectable: Record<string, Ability> = {
  "mara-holdfast": ability("holdfast", "Holdfast", "Passive: Guard also prevents displacement."),
  "mara-clear-order": ability(
    "order",
    "Clear Order",
    "Move an adjacent ally up to 2 tiles toward the nearest unfinished objective."
  ),
  "mara-shelter-line": ability(
    "shelter",
    "Shelter Line",
    "Passive: adjacent allies share Mara's cover."
  ),
  "mara-hand-signal": ability(
    "interpose",
    "Hand Signal",
    "Retarget a visible enemy intent to Mara if in range."
  ),
  "mara-here-we-stand": ability(
    "rally",
    "Here We Stand",
    "Allies within 2 tiles gain Guard and clear restraint.",
    2
  ),
  "mara-second-plan": ability(
    "ready",
    "Second Plan",
    "Once per mission, ready an adjacent ally who has acted.",
    2
  ),
  "iven-read-threshold": ability(
    "read",
    "Read Threshold",
    "Passive: +1 movement; shifts are always listed in the mission panel."
  ),
  "iven-angle-found": ability(
    "angle",
    "Angle Found",
    "Passive: strikes after moving gain 1 power."
  ),
  "iven-slip-route": ability(
    "slip",
    "Slip Route",
    "Cross to an empty tile within 3, ignoring occupied tiles and walls."
  ),
  "iven-pass-it-on": ability(
    "pass",
    "Pass It On",
    "Passive: incapacitating a Marked target marks the nearest enemy."
  ),
  "iven-known-way": ability(
    "gate",
    "Known Way",
    "Once per mission, open a wall within 3 tiles for the rest of the mission."
  ),
  "iven-already-gone": ability(
    "gone",
    "Already Gone",
    "After striking, move up to 5 tiles for 0 AP, once per activation.",
    0
  ),
  "sela-field-care": ability(
    "care",
    "Field Care",
    "Passive: Assist restores 2 vitality instead of 1."
  ),
  "sela-terms-spoken": ability(
    "terms",
    "Terms Spoken",
    "Passive: Call Down accepts enemies at 3 vitality."
  ),
  "sela-stabilize": ability(
    "revive",
    "Stabilize",
    "Once per mission, revive an adjacent incapacitated ally at 2 vitality.",
    2
  ),
  "sela-witness": ability(
    "witness",
    "Witness",
    "Passive: adjacent enemies cannot receive coordinator bonuses."
  ),
  "sela-nobody-lost": ability(
    "cleanse",
    "Nobody Lost",
    "Clear all conditions from allies within 2 tiles.",
    2
  ),
  "sela-open-corridor": ability(
    "corridor",
    "Open Corridor",
    "Jam enemies within 3 tiles; their attacks become Guard this round.",
    2
  ),
  "tarn-good-brace": ability(
    "good",
    "Good Brace",
    "Passive: constructing cover also gives Tarn Guard."
  ),
  "tarn-shear-pin": ability(
    "shear",
    "Shear Pin",
    "Passive: Tool Strike gains 2 additional power against machines."
  ),
  "tarn-bypass": ability(
    "bypass",
    "Bypass",
    "Passive: interact with objectives from 2 tiles away."
  ),
  "tarn-make-a-door": ability(
    "gate",
    "Make a Door",
    "Once per mission, open an adjacent internal wall."
  ),
  "tarn-neighborhood-grid": ability(
    "grid",
    "Neighborhood Grid",
    "Lay up to 3 cover tiles in a straight line from Tarn.",
    2
  ),
  "tarn-clean-stop": ability(
    "disable",
    "Clean Stop",
    "Disable an adjacent machine without dealing damage.",
    2
  ),
  "nera-countermand": ability(
    "jam",
    "Countermand",
    "Jam a visible enemy within 4 tiles; its intent becomes Guard."
  ),
  "nera-known-procedure": ability(
    "procedure",
    "Known Procedure",
    "Passive: the reinforcements enter with no Guard."
  ),
  "nera-return-order": ability(
    "return",
    "Return Order",
    "Make a visible coordinator within 4 tiles surrender.",
    2
  ),
  "nera-chain-of-custody": ability(
    "chain",
    "Chain of Custody",
    "Passive: first objective interaction each activation costs 0 AP."
  ),
  "nera-stand-down": ability(
    "stand",
    "Stand Down",
    "Isolated, injured human enemies within 3 tiles surrender.",
    2
  ),
  "nera-full-record": ability(
    "record",
    "Full Record",
    "Copy a visible enemy's weapon power and range for this mission.",
    2
  ),
};

const passives = new Set([
  "holdfast",
  "shelter",
  "read",
  "angle",
  "pass",
  "care",
  "terms",
  "witness",
  "good",
  "shear",
  "bypass",
  "procedure",
  "chain",
]);
export const isPassive = (item: Ability): boolean => passives.has(item.id);
