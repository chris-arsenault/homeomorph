export interface Combatant {
  readonly id: string;
  readonly vitality: number;
  readonly armor: number;
  readonly guard: number;
  readonly position: Readonly<{ x: number; y: number }>;
}

export interface WeaponProfile {
  readonly power: number;
  readonly minimumRange: number;
  readonly maximumRange: number;
}

export type StrikeBlock = "outside-range" | "same-unit";

export type StrikePreview =
  | { readonly legal: false; readonly reason: StrikeBlock }
  | {
      readonly legal: true;
      readonly damage: number;
      readonly remainingVitality: number;
      readonly consumesGuard: boolean;
      readonly incapacitates: boolean;
    };

export function gridDistance(
  first: Readonly<{ x: number; y: number }>,
  second: Readonly<{ x: number; y: number }>
): number {
  return Math.abs(first.x - second.x) + Math.abs(first.y - second.y);
}

export function previewStrike(
  attacker: Combatant,
  defender: Combatant,
  weapon: WeaponProfile,
  cover: number
): StrikePreview {
  if (attacker.id === defender.id) {
    return { legal: false, reason: "same-unit" };
  }

  const distance = gridDistance(attacker.position, defender.position);
  if (distance < weapon.minimumRange || distance > weapon.maximumRange) {
    return { legal: false, reason: "outside-range" };
  }

  const reduction = defender.armor + cover + defender.guard;
  const damage = Math.max(0, weapon.power - reduction);
  const remainingVitality = Math.max(0, defender.vitality - damage);

  return {
    legal: true,
    damage,
    remainingVitality,
    consumesGuard: defender.guard > 0 && damage > 0,
    incapacitates: remainingVitality === 0,
  };
}
