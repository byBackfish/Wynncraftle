export interface Item {
  internalName: string;
  type: string;
  subType: string;
  icon: {
    value:
      | {
          id: string;
          name: string;
          customModelData: string;
        }
      | string;
    format: string;
  };
  identifier: boolean;
  allow_craftsman: boolean;

  // Variable keys depending on type
  armourMaterial?: string; // For armours
  armourColor?: string;
  attackSpeed?: string; // For weapons
  averageDps?: number; // For weapons
  gatheringSpeed?: number; // For tools
  tier?: string; // For ingredients and materials
  rarity?: string; // For normal items

  // Ingredients
  consumableOnlyIDs?: {
    duration: number;
    charges: number;
  };
  ingredientPositionModifiers?: {
    left: number;
    right: number;
    above: number;
    under: number;
    touching: number;
    not_touching: number;
  };
  itemOnlyIDs?: {
    durability_modifier: number;
    strength_requirement: number;
    dexterity_requirement: number;
    intelligence_requirement: number;
    defence_requirement: number;
    agility_requirement: number;
  };

  majorIds?: {
    majorId: string; // description
  };

  craftable?: string[];

  powderSlots?: number;
  lore?: string;
  dropRestriction?: string;
  restriction?: string;
  raidReward?: boolean;
  dropMeta?: {
    coordinates: [number, number, number];
    name: string;
    type: string;
  };
  base?: {
    baseDamage: {
      min: number;
      max: number;
      raw: number;
    };
    baseHealth?: number;
  };
  requirements?: {
    level: number;
    levelRange: {
      min: number;
      max: number;
    };
    strength: number;
    dexterity: number;
    intelligence: number;
    defence: number;
    agility: number;
    quest: string;
    class_requirement: string;
    skills?: string[]; // For ingredients
  };
  identifications?: Record<
    string,
    number | { min: number; max: number; raw: number }
  >;

  weaponType?: string;
  armourType?: string;
}
