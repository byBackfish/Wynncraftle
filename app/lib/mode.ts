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
  title: string;
  icon: string;

  itemFilter: (item: Item) => boolean;
  stats: {
    [stat: string]: {
      name: string;
      getValue(item: Item): any;
      evaluate(guess: any, target: typeof guess): GuessResult;
    };
  };
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

const evaluateNumbers = (guess: number, target: number): GuessResult => {
  if (guess === target) return GuessResult.CORRECT;
  if (guess > target) return GuessResult.HIGHER;
  return GuessResult.LOWER;
};

export const GameModes: GameMode[] = [
  {
    id: 'weapons',
    icon: '⚔️',
    title: 'Weapons',
    itemFilter: (item) => item?.type === 'weapon',
    stats: {
      rarity: {
        name: 'Rarity',
        getValue: (item) => item.rarity?.toUpperCase() || 'COMMON',
        evaluate: (
          guess: keyof typeof RarityValues,
          target: keyof typeof RarityValues
        ): GuessResult => {
          return evaluateNumbers(RarityValues[guess], RarityValues[target]);
        },
      },
      type: {
        name: 'Type',
        getValue: (item) => item.weaponType?.toUpperCase() || 'SWORD',
        evaluate: (guess: string, target: string): GuessResult => {
          if (guess === target) return GuessResult.CORRECT;
          return GuessResult.INCORRECT;
        },
      },
      level: {
        name: 'Level',
        getValue: (item) => item.requirements?.level ?? 0,
        evaluate: evaluateNumbers,
      },
      powerSlots: {
        name: 'Powder Slots',
        getValue: (item) => item.powderSlots ?? 0,
        evaluate: evaluateNumbers,
      },
      averageDps: {
        name: 'Average DPS',
        getValue: (item) => item.averageDps ?? 0,
        evaluate: evaluateNumbers,
      },
    },
  },
];
