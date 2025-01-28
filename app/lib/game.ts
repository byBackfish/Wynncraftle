import { GameMode, GuessResult } from './mode';
import { Item } from './struct';

async function getAllItems(): Promise<Item[]> {
  try {
    const res = await fetch('/api/items', {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch items: ${res.status}`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error fetching items:', error);
    throw error;
  }
}

export const AllItems = await getAllItems();

export async function getDailyItem(
  mode: GameMode,
  seed: number = new Date().getDay() * 100 + new Date().getDate()
): Promise<Item> {
  const res = await fetch(`/api/daily`, {
    method: 'POST',
    body: JSON.stringify({ seed, mode: mode.id }),
  });

  const data = await res.json();

  return data;
}

export async function getItemsForMode(mode: GameMode): Promise<Item[]> {
  return AllItems.filter((item) => mode.itemFilter(item));
}

export function evaluateGuess(
  mode: GameMode,
  guess: Item,
  target: Item
): Record<string, GuessResult> {
  return Object.keys(mode.stats).reduce((acc, statName) => {
    const stat = mode.stats[statName];

    const guessStat = stat.getValue(guess);
    const targetStat = stat.getValue(target);

    const result = stat.evaluate(guessStat, targetStat);

    acc[statName] = result;

    return acc;
  }, {} as Record<string, GuessResult>);
}
