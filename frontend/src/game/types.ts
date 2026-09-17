import type { Point } from "../content/types";
export type { Point } from "../content/types";
export type Condition = "marked" | "restrained" | "braced" | "jammed" | "exposed";
export type Side = "crew" | "enemy";
export type Action =
  | "move"
  | "strike"
  | "guard"
  | "assist"
  | "interact"
  | "core1"
  | "core2"
  | "skill1"
  | "skill2"
  | "skill3";

export interface Unit {
  id: string;
  template: string;
  name: string;
  side: Side;
  kind: "human" | "drone" | "rig";
  position: Point;
  vitality: number;
  maximumVitality: number;
  armor: number;
  power: number;
  range: number;
  movement: number;
  guard: number;
  conditions: Condition[];
  restraintSource: string | null;
  ready: boolean;
  surrendered: boolean;
  moved: boolean;
  used: string[];
  skills: string[];
}

export interface Intent {
  unitId: string;
  destination: Point;
  targetId: string | null;
  action: "strike" | "lock" | "guard";
  path: Point[];
  aim: Point | null;
}

export interface Objective {
  id: string;
  name: string;
  position: Point;
  needed: number;
  progress: number;
  optional: boolean;
  flag: string | null;
}

export interface Battle {
  mission: number;
  round: number;
  tiles: string[];
  units: Unit[];
  objectives: Objective[];
  activeId: string | null;
  ap: number;
  intents: Intent[];
  shifted: boolean;
  reinforcementsArrived: boolean;
  pressure: number;
  outcome: "playing" | "won" | "lost";
  log: string[];
}

export interface Difficulty {
  name: "Story" | "Standard" | "Exacting" | "Custom";
  rewinds: number;
  reinforcementDelay: number;
  eliteVitality: number;
  optionalRounds: number;
  preview: number;
}

export interface Session {
  version: 1;
  stage: "briefing" | "battle" | "debrief" | "ending";
  mission: number;
  completed: number[];
  roster: string[];
  skills: Record<string, string[]>;
  flags: string[];
  difficulty: Difficulty;
  battle: Battle | null;
  checkpoint: Battle | null;
  rewindsUsed: number;
}

export type Command =
  | { type: "select"; unitId: string }
  | { type: "act"; action: Action; target: Point }
  | { type: "end" };

export interface Transition {
  state: Battle;
  legal: boolean;
  message: string;
}
