export type CampaignAct = "I" | "II" | "III" | "Epilogue";

export interface MissionDefinition {
  readonly id: string;
  readonly sequence: number;
  readonly act: CampaignAct;
  readonly title: string;
  readonly location: string;
  readonly objective: string;
  readonly teaches: readonly string[];
}

export interface CharacterDefinition {
  readonly id: string;
  readonly name: string;
  readonly role: string;
  readonly combatIdentity: string;
  readonly arc: string;
  readonly branches: readonly [string, string];
}

export type EnemyKind = "human" | "drone" | "rig";

export interface EnemyDefinition {
  readonly id: string;
  readonly name: string;
  readonly kind: EnemyKind;
  readonly purpose: string;
  readonly intent: string;
  readonly counterplay: string;
}

export interface SkillChoiceDefinition {
  readonly id: string;
  readonly characterId: string;
  readonly tier: 1 | 2 | 3;
  readonly branch: string;
  readonly name: string;
  readonly effect: string;
}
