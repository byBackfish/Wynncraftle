import type { Item } from './struct.ts';

export enum GuessResult {
  CORRECT, // Green
  CLOSE, // Yellow
  HIGHER, // Up Arrow but Red
  LOWER, // Down Arrow but Red
  INCORRECT, // Red
}

export interface GameMode {
  id: string;
  description: string;
  title: string;
  icon: string;

  itemFilter: (item: Item) => boolean;
  stats: Record<string, Stat>;
}

interface Stat {
  name: string;
  getValue(item: Item): any;
  evaluate(guess: any, target: typeof guess): GuessResult;
}

export enum RarityValues {
  COMMON = 1,
  UNIQUE = 2,
  RARE = 3,
  LEGENDARY = 4,
  SET = 5,
  FABLED = 6,
  MYTHIC = 7,
}

export enum AttackSpeedValues {
  SUPER_SLOW = 1,
  VERY_SLOW = 2,
  SLOW = 3,
  NORMAL = 4,
  FAST = 5,
  VERY_FAST = 6,
  SUPER_FAST = 7,
}

const evaluateNumbers = (guess: number, target: number): GuessResult => {
  if (guess === target) return GuessResult.CORRECT;
  if (guess > target) return GuessResult.HIGHER;
  return GuessResult.LOWER;
};

const RarityStat: Stat = {
  name: 'Rarity',
  getValue: (item) => item.rarity?.toUpperCase() || 'COMMON',
  evaluate: (
    guess: keyof typeof RarityValues,
    target: keyof typeof RarityValues
  ): GuessResult => {
    return evaluateNumbers(RarityValues[guess], RarityValues[target]);
  },
};

const TypeStat: Stat = {
  name: 'Type',
  getValue: (item) => item.weaponType?.toUpperCase() || 'SWORD',
  evaluate: (guess: string, target: string): GuessResult => {
    if (guess === target) return GuessResult.CORRECT;
    return GuessResult.INCORRECT;
  },
};

const LevelStat: Stat = {
  name: 'Level',
  getValue: (item) => item.requirements?.level ?? 0,
  evaluate: evaluateNumbers,
};

const PowderSlotsStat: Stat = {
  name: 'Powder Slots',
  getValue: (item) => item.powderSlots ?? 0,
  evaluate: evaluateNumbers,
};

export const GameModes: GameMode[] = [
  {
    id: 'weapons',
    icon: '⚔️',
    title: 'Weapons',
    description: "Guess today's Wynncraft weapon",
    itemFilter: (item) => item?.type === 'weapon',
    stats: {
      rarity: RarityStat,
      type: TypeStat,
      level: LevelStat,
      powerSlots: PowderSlotsStat,
      attackSpeed: {
        name: 'Attack Speed',
        getValue: (item) => item.attackSpeed?.toUpperCase() ?? 'NORMAL',
        evaluate: (
          guess: keyof typeof AttackSpeedValues,
          target: keyof typeof AttackSpeedValues
        ): GuessResult => {
          return evaluateNumbers(
            AttackSpeedValues[guess],
            AttackSpeedValues[target]
          );
        },
      },
      averageDps: {
        name: 'Average DPS',
        getValue: (item) => item.averageDps ?? 0,
        evaluate: evaluateNumbers,
      },
    },
  },
  {
    id: 'armor',
    title: 'Armor',
    description: "Guess today's Wynncraft armor",
    icon: '🛡',
    itemFilter: (item) => item?.type === 'armour',
    stats: {
      rarity: RarityStat,
      type: TypeStat,
      level: LevelStat,
      powderSlots: PowderSlotsStat,
      health: {
        name: 'Health',
        getValue: (item) => item.base?.baseHealth ?? 0,
        evaluate: evaluateNumbers,
      },
    },
  },
  {
    id: 'ingredients',
    title: 'Ingredients',
    description: "Guess today's Wynncraft crafting ingredient",
    icon: '🍳',
    itemFilter: (item) => item?.type === 'ingredient',
    stats: {
      tier: {
        name: 'Tier',
        getValue: (item) => item.tier ?? 0,
        evaluate: evaluateNumbers,
      },
      skill: {
        name: 'Skill',
        getValue: (item) => item.requirements?.skills ?? '',
        evaluate(guess: string[], target: string[]) {
          if (guess.length === target.length) {
            return guess.every((g, i) => g === target[i])
              ? GuessResult.CORRECT
              : GuessResult.INCORRECT;
          }

          if (guess.some((g) => target.includes(g))) {
            return GuessResult.CLOSE;
          }

          return GuessResult.INCORRECT;
        },
      },
      level: LevelStat,
    },
  },
];
