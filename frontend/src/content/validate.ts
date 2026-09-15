import type {
  CharacterDefinition,
  EnemyDefinition,
  MissionDefinition,
  SkillChoiceDefinition,
} from "./types";

export interface GameContent {
  readonly missions: readonly MissionDefinition[];
  readonly characters: readonly CharacterDefinition[];
  readonly enemies: readonly EnemyDefinition[];
  readonly skills: readonly SkillChoiceDefinition[];
}

function duplicateIds(items: readonly { readonly id: string }[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const item of items) {
    if (seen.has(item.id)) {
      duplicates.add(item.id);
    }
    seen.add(item.id);
  }

  return [...duplicates];
}

function validateSequences(missions: readonly MissionDefinition[]): string[] {
  const sequences = missions.map((mission) => mission.sequence).sort((left, right) => left - right);
  const errors: string[] = [];

  sequences.forEach((sequence, index) => {
    if (sequence !== index) {
      errors.push(`Campaign sequence must be contiguous; expected ${index}, found ${sequence}.`);
    }
  });

  return errors;
}

function validateSkills(
  characters: readonly CharacterDefinition[],
  skills: readonly SkillChoiceDefinition[]
): string[] {
  const characterIds = new Set(characters.map((character) => character.id));
  const tierErrors = characters.flatMap((character) => validateCharacterSkills(character, skills));
  const referenceErrors = skills
    .filter((skill) => !characterIds.has(skill.characterId))
    .map((skill) => `${skill.name} references an unknown character: ${skill.characterId}.`);

  return [...tierErrors, ...referenceErrors];
}

function validateCharacterSkills(
  character: CharacterDefinition,
  skills: readonly SkillChoiceDefinition[]
): string[] {
  return ([1, 2, 3] as const).flatMap((tier) => {
    const choices = skills.filter(
      (skill) => skill.characterId === character.id && skill.tier === tier
    );
    const branches = new Set(choices.map((choice) => choice.branch));
    const countErrors =
      choices.length === 2 && branches.size === 2
        ? []
        : [`${character.name} must have two distinct choices at tier ${tier}.`];
    const branchErrors = [...branches]
      .filter((branch) => !character.branches.includes(branch))
      .map((branch) => `${character.name} has an unknown skill branch: ${branch}.`);

    return [...countErrors, ...branchErrors];
  });
}

export function validateContent(content: GameContent): string[] {
  const groups = [content.missions, content.characters, content.enemies, content.skills];
  const duplicateErrors = groups.flatMap((items) =>
    duplicateIds(items).map((id) => `Duplicate content id: ${id}.`)
  );

  return [
    ...duplicateErrors,
    ...validateSequences(content.missions),
    ...validateSkills(content.characters, content.skills),
  ];
}
