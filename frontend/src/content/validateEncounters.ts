import boards from "./boards.json";
import { characters } from "./characters";
import { campaign } from "./campaign";
import { enemies } from "./enemies";
import { deploymentPoints, encounters, enemyPoints, mapTiles } from "./encounters";
import { skillChoices } from "./skills";
import { validateContent } from "./validate";

export function validateCampaign(): string[] {
  const errors = validateContent({ missions: campaign, characters, enemies, skills: skillChoices });
  if (boards.version !== 1) errors.push("Unsupported map version.");
  if (encounters.length !== 10) errors.push("The campaign requires ten playable sequences.");
  encounters.forEach((encounter, index) => {
    const tiles = mapTiles(index);
    if (tiles.length !== 9 || tiles.some((row) => !/^[#.c+]{12}$/.test(row)))
      errors.push(`Mission ${index}: invalid board.`);
    const points = [
      ...deploymentPoints,
      ...enemyPoints.slice(0, encounter.enemies.length),
      ...encounter.tasks.map((task) => task.position),
    ];
    if (points.some((point) => tiles[point.y]?.[point.x] === "#"))
      errors.push(`Mission ${index}: spawn or objective inside wall.`);
    if (!encounter.tasks.some((task) => !task.optional))
      errors.push(`Mission ${index}: missing primary objective.`);
    if (new Set(encounter.tasks.map((task) => task.id)).size !== encounter.tasks.length)
      errors.push(`Mission ${index}: duplicate objective.`);
    const enemyIds: string[] = enemies.map((enemy) => enemy.id);
    if (encounter.enemies.some((id) => !enemyIds.includes(id)))
      errors.push(`Mission ${index}: unknown enemy.`);
  });
  return errors;
}
