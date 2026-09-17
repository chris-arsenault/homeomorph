import { characters } from "../content/characters";
import { enemies } from "../content/enemies";
import type { Point, Unit } from "./types";

const profiles: Record<string, readonly [number, number, number, number, number]> = {
  mara: [8, 1, 4, 3, 4],
  iven: [6, 0, 4, 4, 5],
  sela: [7, 0, 3, 3, 4],
  tarn: [8, 1, 4, 2, 4],
  nera: [7, 1, 4, 3, 4],
  "retrieval-officer": [4, 0, 3, 3, 3],
  "brace-carrier": [6, 1, 3, 2, 2],
  "lock-engineer": [4, 0, 2, 2, 3],
  surveyor: [4, 0, 4, 6, 2],
  "restraint-drone": [3, 0, 2, 3, 4],
  "linebreaker-rig": [7, 1, 4, 1, 2],
  "field-coordinator": [5, 0, 3, 3, 3],
  "departure-auxiliary": [4, 0, 3, 2, 4],
};

export function createUnit(
  template: string,
  id: string,
  position: Point,
  skills: string[] = [],
  elite = 0
): Unit {
  const hero = characters.find((character) => character.id === template);
  const enemy = enemies.find((definition) => definition.id === template);
  const [vitality, armor, power, range, move] = profiles[template];
  const bonus = ["field-coordinator", "linebreaker-rig"].includes(template) ? elite : 0;
  return {
    id,
    template,
    name: hero ? hero.name : enemy!.name,
    side: hero ? "crew" : "enemy",
    kind: enemy?.kind ?? "human",
    position,
    vitality: vitality + bonus,
    maximumVitality: vitality + bonus,
    armor,
    power,
    range,
    movement: move,
    guard: 0,
    conditions: [],
    restraintSource: null,
    ready: true,
    surrendered: false,
    moved: false,
    used: [],
    skills: [...skills],
  };
}
